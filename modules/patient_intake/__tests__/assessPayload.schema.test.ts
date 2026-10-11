import { describe, it, expect } from 'vitest';
import { assessPayloadSchema } from '../schemas/assessPayload.schema';

describe('Assess Payload Schema & Contract Tests', () => {
  const validPayload = {
    patient_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    chief_complaint: 'Severe chest tightness and shortness of breath for 1 hour',
    symptom_vector: {
      cardiac: {
        chest_pain_character: 'pressure' as const,
        radiation: 'left_arm' as const,
        diaphoresis: true,
        palpitations: true,
      },
      respiratory: {
        cough_character: 'none' as const,
        accessory_muscle_use: false,
        stridor: false,
      },
    },
    vitals: {
      heart_rate: 110,
      respiratory_rate: 22,
      systolic_bp: 145,
      diastolic_bp: 95,
      oxygen_saturation: 96.0,
      temperature_celsius: 37.1,
      capillary_blood_glucose: 115.0,
    },
    missing_essential_vitals: [],
    medical_history: {
      immunosuppression: false,
      severe_chronic_comorbidity: true,
      comorbidity_note: 'Hypertension and Type 2 Diabetes diagnosed 5 years ago',
      pregnancy_status: 'not_applicable' as const,
    },
    language: 'en' as const,
  };

  it('validates a complete, compliant payload successfully', () => {
    const result = assessPayloadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  describe('Database column name alignment (Contract check)', () => {
    it('verifies exact field naming matching vital_signs and triage_assessments tables', () => {
      const parsed = assessPayloadSchema.parse(validPayload);

      // Top-level triage_assessments column names
      expect(parsed).toHaveProperty('patient_id');
      expect(parsed).toHaveProperty('chief_complaint');
      expect(parsed).toHaveProperty('symptom_vector');
      expect(parsed).toHaveProperty('vitals');

      // vital_signs column names
      const vitals = parsed.vitals;
      expect(vitals).toHaveProperty('heart_rate');
      expect(vitals).toHaveProperty('respiratory_rate');
      expect(vitals).toHaveProperty('systolic_bp');
      expect(vitals).toHaveProperty('diastolic_bp');
      expect(vitals).toHaveProperty('oxygen_saturation');
      expect(vitals).toHaveProperty('temperature_celsius');
      expect(vitals).toHaveProperty('capillary_blood_glucose');
    });
  });

  describe('Strict mode enforcement (rejecting unknown properties)', () => {
    it('rejects unknown fields at the root payload level', () => {
      const payloadWithExtra = {
        ...validPayload,
        unauthorized_root_field: 'malicious_or_unknown',
      };
      const result = assessPayloadSchema.safeParse(payloadWithExtra);
      expect(result.success).toBe(false);
    });

    it('rejects unknown fields inside vitals', () => {
      const payloadWithExtraVital = {
        ...validPayload,
        vitals: {
          ...validPayload.vitals,
          invasive_arterial_pressure: 120,
        },
      };
      const result = assessPayloadSchema.safeParse(payloadWithExtraVital);
      expect(result.success).toBe(false);
    });

    it('rejects unknown fields inside medical_history', () => {
      const payloadWithExtraHistory = {
        ...validPayload,
        medical_history: {
          ...validPayload.medical_history,
          untracked_surgery_score: 99,
        },
      };
      const result = assessPayloadSchema.safeParse(payloadWithExtraHistory);
      expect(result.success).toBe(false);
    });

    it('rejects unknown fields inside symptom_vector', () => {
      const payloadWithExtraSymptom = {
        ...validPayload,
        symptom_vector: {
          ...validPayload.symptom_vector,
          unregistered_clinical_domain: { active: true },
        },
      };
      const result = assessPayloadSchema.safeParse(payloadWithExtraSymptom);
      expect(result.success).toBe(false);
    });
  });

  describe('patient_id validation', () => {
    it('rejects invalid non-UUID patient_id', () => {
      const result = assessPayloadSchema.safeParse({
        ...validPayload,
        patient_id: 'not-a-uuid-1234',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('chief_complaint validation', () => {
    it('trims whitespace and requires non-empty text', () => {
      const result = assessPayloadSchema.safeParse({
        ...validPayload,
        chief_complaint: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('rejects chief_complaint exceeding 500 characters', () => {
      const longComplaint = 'A'.repeat(501);
      const result = assessPayloadSchema.safeParse({
        ...validPayload,
        chief_complaint: longComplaint,
      });
      expect(result.success).toBe(false);
    });

    it('accepts chief_complaint exactly 500 characters', () => {
      const boundaryComplaint = 'A'.repeat(500);
      const result = assessPayloadSchema.safeParse({
        ...validPayload,
        chief_complaint: boundaryComplaint,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('medical_history comorbidity_note validation', () => {
    it('rejects comorbidity_note exceeding 200 characters', () => {
      const longNote = 'X'.repeat(201);
      const result = assessPayloadSchema.safeParse({
        ...validPayload,
        medical_history: {
          ...validPayload.medical_history,
          comorbidity_note: longNote,
        },
      });
      expect(result.success).toBe(false);
    });

    it('accepts comorbidity_note exactly 200 characters or null', () => {
      const boundaryNote = 'X'.repeat(200);
      expect(
        assessPayloadSchema.safeParse({
          ...validPayload,
          medical_history: {
            ...validPayload.medical_history,
            comorbidity_note: boundaryNote,
          },
        }).success
      ).toBe(true);

      expect(
        assessPayloadSchema.safeParse({
          ...validPayload,
          medical_history: {
            ...validPayload.medical_history,
            comorbidity_note: null,
          },
        }).success
      ).toBe(true);
    });
  });

  describe('missing_essential_vitals cross-validation', () => {
    it('requires missing_essential_vitals to accurately list missing essentials', () => {
      const payloadMissingSpo2 = {
        ...validPayload,
        vitals: {
          ...validPayload.vitals,
          oxygen_saturation: null,
        },
        missing_essential_vitals: ['oxygen_saturation'],
      };
      expect(assessPayloadSchema.safeParse(payloadMissingSpo2).success).toBe(true);
    });

    it('fails if essential vital is missing from vitals but NOT listed in missing_essential_vitals', () => {
      const inconsistentPayload = {
        ...validPayload,
        vitals: {
          ...validPayload.vitals,
          oxygen_saturation: null,
        },
        missing_essential_vitals: [], // missing oxygen_saturation!
      };
      const result = assessPayloadSchema.safeParse(inconsistentPayload);
      expect(result.success).toBe(false);
    });

    it('fails if essential vital is present in vitals but falsely listed in missing_essential_vitals', () => {
      const inconsistentPayload = {
        ...validPayload,
        vitals: {
          ...validPayload.vitals,
          oxygen_saturation: 98.0,
        },
        missing_essential_vitals: ['oxygen_saturation'], // falsely listed!
      };
      const result = assessPayloadSchema.safeParse(inconsistentPayload);
      expect(result.success).toBe(false);
    });
  });
});
