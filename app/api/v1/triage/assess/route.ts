import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { assessPayloadSchema } from '@/modules/patient_intake/schemas/assessPayload.schema';
import { generateGeminiRiskExplanation } from '@/modules/patient_intake/services/geminiService';
import { TriageEngine } from '@/modules/triage_engine/services/triageEngine';
import { AlertDispatcherService } from '@/modules/triage_engine/services/alertDispatcher';
import { doctorService } from '@/modules/doctor_dashboard/services/doctorService';
import { AuditJournalService } from '@/modules/audit_compliance/services/auditJournalService';
import { TriageAssessment, VitalSigns } from '@/shared/types/triage';
import { CLINICAL_DISCLAIMER_EN, CLINICAL_DISCLAIMER_TA } from '@/shared/constants/acuity';
import {
  ApiSuccessEnvelope,
  ApiErrorEnvelope,
  VitalsInput,
  MedicalHistory,
  SymptomVector,
} from '@/modules/patient_intake/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    const errorResponse: ApiErrorEnvelope = {
      data: null,
      meta: { timestamp },
      error: {
        code: 'INVALID_JSON',
        message: 'Request body must be valid JSON.',
      },
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const parseResult = assessPayloadSchema.safeParse(body);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    const errorResponse: ApiErrorEnvelope = {
      data: null,
      meta: { timestamp },
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Payload failed clinical intake validation schema.',
        details: errorDetails,
      },
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const validated = parseResult.data;

  try {
    const normalizedVitals: VitalsInput = {
      heart_rate: validated.vitals.heart_rate ?? null,
      respiratory_rate: validated.vitals.respiratory_rate ?? null,
      systolic_bp: validated.vitals.systolic_bp ?? null,
      diastolic_bp: validated.vitals.diastolic_bp ?? null,
      oxygen_saturation: validated.vitals.oxygen_saturation ?? null,
      temperature_celsius: validated.vitals.temperature_celsius ?? null,
      capillary_blood_glucose: validated.vitals.capillary_blood_glucose ?? null,
    };

    const normalizedMedicalHistory: MedicalHistory = {
      immunosuppression: validated.medical_history.immunosuppression,
      severe_chronic_comorbidity: validated.medical_history.severe_chronic_comorbidity,
      comorbidity_note: validated.medical_history.comorbidity_note ?? null,
      pregnancy_status: validated.medical_history.pregnancy_status ?? undefined,
    };

    const normalizedSymptoms: SymptomVector = {
      ...validated.symptom_vector,
      medical_history: normalizedMedicalHistory,
    };

    // 1. Run Deterministic Triage Engine & Red-Flag Safety Pre-Check (Specification Section 4 & 5)
    const triageResult = TriageEngine.assess({
      patient_id: validated.patient_id,
      chief_complaint: validated.chief_complaint,
      vitals: normalizedVitals,
      symptom_vector: normalizedSymptoms,
      medical_history: normalizedMedicalHistory,
      language: validated.language,
    });

    // 2. Generate AI Decision-Support Explanation (Prompt-Guarded with Graceful Fallback)
    const aiExplanation = await generateGeminiRiskExplanation({
      chiefComplaint: validated.chief_complaint,
      symptoms: normalizedSymptoms,
      vitals: normalizedVitals,
      missingEssentialVitals: triageResult.missing_essential_vitals,
      language: validated.language,
    });

    const assessmentId = crypto.randomUUID();
    const vitalId = crypto.randomUUID();

    const vitalSnapshot: VitalSigns = {
      id: vitalId,
      patient_id: validated.patient_id,
      heart_rate: normalizedVitals.heart_rate,
      respiratory_rate: normalizedVitals.respiratory_rate,
      systolic_bp: normalizedVitals.systolic_bp,
      diastolic_bp: normalizedVitals.diastolic_bp,
      oxygen_saturation: normalizedVitals.oxygen_saturation,
      temperature_celsius: normalizedVitals.temperature_celsius,
      capillary_blood_glucose: normalizedVitals.capillary_blood_glucose,
      recorded_by: 'patient_self_intake',
      recorded_at: timestamp,
    };

    const assessmentRecord: TriageAssessment = {
      id: assessmentId,
      patient_id: validated.patient_id,
      vital_id: vitalId,
      chief_complaint: validated.chief_complaint,
      symptom_vector: normalizedSymptoms as Record<string, boolean | string | number>,
      calculated_risk_score: triageResult.calculated_risk_score,
      calculated_category: triageResult.calculated_category,
      hard_red_flag_triggered: triageResult.hard_red_flag_triggered,
      red_flag_details: triageResult.red_flag_details,
      confidence_score: triageResult.confidence_score,
      explainability_payload: triageResult.explainability_payload,
      status: 'PENDING_REVIEW',
      created_at: timestamp,
      patient: {
        id: validated.patient_id,
        mrn_hash: crypto.createHash('sha256').update(validated.patient_id).digest('hex').substring(0, 16),
        display_name: 'Patient (Intake Terminal)',
        date_of_birth: '1985-05-15',
        gender: 'OTHER',
        primary_language: validated.language,
        created_at: timestamp,
        updated_at: timestamp,
      },
      vitals: vitalSnapshot,
    };

    // 3. Immediately Dispatch to Doctor Emergency Workstation Queue
    doctorService.addAssessment(assessmentRecord);

    // 4. If Hard Red Flag Triggered -> Dispatch Emergency Alert (isolated, does not block persistence)
    if (triageResult.hard_red_flag_triggered) {
      await AlertDispatcherService.dispatchEmergencyAlert({
        assessmentId,
        patientId: validated.patient_id,
        flags: triageResult.red_flag_details.map((msg, idx) => ({
          domain: idx + 1,
          domainName: 'Clinical Safety Red Flag',
          ruleCode: 'TIER_1_CRITICAL',
          observed: null,
          threshold: 'Deterministic Red Flag Boundary',
          clinicalFocus: 'Immediate Resuscitation',
          message: msg,
        })),
      });
    }

    // 5. Record Audit Event in Immutable Append-Only Journal
    await AuditJournalService.recordEvent({
      event_type: triageResult.hard_red_flag_triggered ? 'TIER_1_RED_FLAG_TRIGGERED' : 'TRIAGE_ASSESSMENT_COMPLETED',
      patient_id: validated.patient_id,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      user_agent: req.headers.get('user-agent') || 'MediAI-Intake',
      payload: {
        assessment_id: assessmentId,
        acuity_category: triageResult.calculated_category,
        risk_score: triageResult.calculated_risk_score,
        hard_red_flag_triggered: triageResult.hard_red_flag_triggered,
        red_flag_count: triageResult.red_flag_details.length,
        confidence_level: triageResult.confidence_level,
      },
    });

    const disclaimer = validated.language === 'ta' ? CLINICAL_DISCLAIMER_TA : CLINICAL_DISCLAIMER_EN;

    const successResponse: ApiSuccessEnvelope<unknown> = {
      data: {
        assessment_id: assessmentId,
        patient_id: validated.patient_id,
        status: 'PENDING_REVIEW',
        calculated_risk_score: triageResult.calculated_risk_score,
        calculated_category: triageResult.calculated_category,
        hard_red_flag_triggered: triageResult.hard_red_flag_triggered,
        red_flag_details: triageResult.red_flag_details,
        confidence_score: triageResult.confidence_score,
        confidence_level: triageResult.confidence_level,
        missing_essential_vitals: triageResult.missing_essential_vitals,
        score_breakdown: triageResult.score_breakdown,
        explainability_payload: triageResult.explainability_payload,
        risk_explanation: aiExplanation,
        clinical_disclaimer: disclaimer,
      },
      meta: {
        timestamp,
        version: 'v1',
      },
      error: null,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    const errorResponse: ApiErrorEnvelope = {
      data: null,
      meta: { timestamp },
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
