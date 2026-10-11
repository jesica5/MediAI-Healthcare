import { describe, it, expect } from 'vitest';
import { TriageEngine } from '../services/triageEngine';
import { doctorService } from '@/modules/doctor_dashboard/services/doctorService';
import { AuditJournalService } from '@/modules/audit_compliance/services/auditJournalService';
import { TriageAssessment } from '@/shared/types/triage';

describe('End-to-End Clinical Intake-to-Doctor-Override Workflow Simulation', () => {
  it('executes full intake -> triage calculation -> doctor queue dispatch -> physician review & override', async () => {
    const patientId = 'pt-e2e-simulation-777';
    const chiefComplaint = 'Severe crushing retrosternal chest pain radiating to left jaw, diaphoresis';

    // Step 1: Patient presents with symptoms & vitals
    const intakeInput = {
      patient_id: patientId,
      chief_complaint: chiefComplaint,
      vitals: {
        heart_rate: 122,
        respiratory_rate: 24,
        systolic_bp: 145,
        diastolic_bp: 95,
        oxygen_saturation: 93.0,
        temperature_celsius: 37.1,
      },
      symptom_vector: {
        cardiac: {
          chest_pain_character: 'pressure' as const,
          radiation: 'jaw' as const,
          diaphoresis: true,
          palpitations: true,
        },
      },
      demographics: { age: 67 },
      medical_history: { severe_chronic_comorbidity: true },
    };

    // Step 2: Triage Engine processes assessment
    const triageResult = TriageEngine.assess(intakeInput);

    // Verify Tier-1 Hard Red Flag (Domain 3 Cardiac ACS) was triggered
    expect(triageResult.hard_red_flag_triggered).toBe(true);
    expect(triageResult.calculated_category).toBe('CRITICAL');
    expect(triageResult.calculated_risk_score).toBeGreaterThanOrEqual(85);
    expect(triageResult.red_flag_details[0]).toContain('Acute Coronary Syndrome');

    // Step 3: Persist into Doctor Emergency Queue
    const assessmentId = 'ast-e2e-cardiac-777';
    const newAssessment: TriageAssessment = {
      id: assessmentId,
      patient_id: patientId,
      vital_id: 'vit-777',
      chief_complaint: chiefComplaint,
      symptom_vector: intakeInput.symptom_vector,
      calculated_risk_score: triageResult.calculated_risk_score,
      calculated_category: triageResult.calculated_category,
      hard_red_flag_triggered: triageResult.hard_red_flag_triggered,
      red_flag_details: triageResult.red_flag_details,
      confidence_score: triageResult.confidence_score,
      explainability_payload: triageResult.explainability_payload,
      status: 'PENDING_REVIEW',
      created_at: new Date().toISOString(),
      patient: {
        id: patientId,
        mrn_hash: 'a1b2c3d4e5f67890',
        display_name: 'Patient E2E',
        date_of_birth: '1959-03-21',
        gender: 'MALE',
        primary_language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      vitals: {
        id: 'vit-777',
        patient_id: patientId,
        ...intakeInput.vitals,
        capillary_blood_glucose: null,
        recorded_by: 'triage_nurse',
        recorded_at: new Date().toISOString(),
      },
    };

    doctorService.addAssessment(newAssessment);

    // Step 4: Doctor queries emergency queue
    const queueResponse = await doctorService.getTriageQueue({ status: 'PENDING_REVIEW' });
    expect(queueResponse.error).toBeNull();
    const queueItems = queueResponse.data || [];
    expect(queueItems.length).toBeGreaterThan(0);

    // Critical Red Flag patient must be present in queue and flagged as Critical Priority 1
    const cardiacItem = queueItems.find((item) => item.id === assessmentId);
    expect(cardiacItem).toBeDefined();
    expect(cardiacItem?.hard_red_flag_triggered).toBe(true);
    expect(cardiacItem?.calculated_category).toBe('CRITICAL');

    // Step 5: Doctor attempts downgrade without rationale -> MUST BE REJECTED
    const failedOverride = await doctorService.submitDoctorOverride({
      assessment_id: assessmentId,
      doctor_id: 'doc-er-attending',
      final_category: 'HIGH',
      override_reason: 'Too brief', // Less than 15 chars
    });
    expect(failedOverride.error).toBeDefined();
    expect(failedOverride.error?.code).toBe('SAFETY_RULE_VIOLATION');

    // Step 6: Doctor provides full clinical rationale and signs off
    const successfulOverride = await doctorService.submitDoctorOverride({
      assessment_id: assessmentId,
      final_category: 'CRITICAL',
      doctor_id: 'doc-lead-cardiologist',
      override_reason: 'Confirmed ST elevation on bedside ECG. Transferred to cath lab.',
    });
    expect(successfulOverride.error).toBeNull();
    expect(successfulOverride.data?.status).toBe('CONFIRMED');

    // Step 7: Verify tamper-evident audit journal recorded the event
    expect(AuditJournalService.verifyIntegrity()).toBe(true);
  });
});
