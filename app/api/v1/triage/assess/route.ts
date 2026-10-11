import { NextRequest, NextResponse } from 'next/server';
import { assessPayloadSchema } from '../../../../../modules/patient_intake/schemas/assessPayload.schema';
import { generateGeminiRiskExplanation } from '../../../../../modules/patient_intake/services/geminiService';
import {
  ApiSuccessEnvelope,
  ApiErrorEnvelope,
  VitalsInput,
  MedicalHistory,
  SymptomVector,
} from '../../../../../modules/patient_intake/types';

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

    const aiExplanation = await generateGeminiRiskExplanation({
      chiefComplaint: validated.chief_complaint,
      symptoms: normalizedSymptoms,
      vitals: normalizedVitals,
      missingEssentialVitals: validated.missing_essential_vitals,
      language: validated.language,
    });

    const successResponse: ApiSuccessEnvelope<unknown> = {
      data: {
        assessment_id: crypto.randomUUID(),
        patient_id: validated.patient_id,
        status: 'received',
        risk_explanation: aiExplanation,
        missing_essential_vitals: validated.missing_essential_vitals,
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
