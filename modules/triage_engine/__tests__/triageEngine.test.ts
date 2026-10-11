import { describe, it, expect } from 'vitest';
import { TriageEngine } from '../services/triageEngine';

describe('TriageEngine Master Mathematical Formulation & Orchestration', () => {
  it('correctly stratifies healthy baseline patient into LOW acuity (Priority 4)', () => {
    const output = TriageEngine.assess({
      patient_id: 'pt-normal-001',
      chief_complaint: 'Mild sprain on left ankle after playing tennis',
      vitals: {
        heart_rate: 68,
        respiratory_rate: 14,
        systolic_bp: 115,
        diastolic_bp: 75,
        oxygen_saturation: 99.0,
        temperature_celsius: 36.6,
        capillary_blood_glucose: 90.0,
      },
      symptom_vector: {},
      demographics: { age: 28 },
    });

    expect(output.calculated_category).toBe('LOW');
    expect(output.calculated_risk_score).toBeLessThan(30);
    expect(output.hard_red_flag_triggered).toBe(false);
    expect(output.confidence_level).toBe('HIGH');
    expect(output.explainability_payload.latency_ms).toBeLessThan(100);
  });

  it('HARD RED FLAG OVERRIDE: forces CRITICAL (Priority 1, score >= 85) even when other inputs are normal', () => {
    // SpO2 < 90% is a Tier-1 Red Flag
    const output = TriageEngine.assess({
      patient_id: 'pt-redflag-002',
      chief_complaint: 'Shortness of breath',
      vitals: {
        heart_rate: 80,
        respiratory_rate: 18,
        systolic_bp: 120,
        diastolic_bp: 80,
        oxygen_saturation: 86.0, // Critical hypoxemia
        temperature_celsius: 37.0,
      },
      symptom_vector: {},
      demographics: { age: 45 },
    });

    expect(output.hard_red_flag_triggered).toBe(true);
    expect(output.calculated_category).toBe('CRITICAL');
    expect(output.calculated_risk_score).toBe(100);
    expect(output.red_flag_details.length).toBeGreaterThan(0);
    expect(output.red_flag_details[0]).toContain('hypoxemia');
  });

  it('flags confidence as "LOW" when essential vitals (SpO2, SBP, or HR) are missing', () => {
    const output = TriageEngine.assess({
      patient_id: 'pt-missing-vitals',
      chief_complaint: 'Headache and fatigue',
      vitals: {
        temperature_celsius: 37.2,
        // Heart rate, systolic BP, and SpO2 intentionally omitted
      },
      symptom_vector: {},
      demographics: { age: 35 },
    });

    expect(output.confidence_level).toBe('LOW');
    expect(output.confidence_score).toBeLessThanOrEqual(0.70);
    expect(output.missing_essential_vitals).toContain('oxygen_saturation');
    expect(output.missing_essential_vitals).toContain('systolic_bp');
    expect(output.missing_essential_vitals).toContain('heart_rate');
    expect(output.explainability_payload.missing_vitals_warning).toBe(true);
  });

  it('incorporates physiological trajectory delta score (S_delta) from previous vitals', () => {
    const previousVitals = [
      {
        id: 'vit_prev_1',
        patient_id: 'pt-delta-001',
        heart_rate: 85,
        respiratory_rate: 18,
        systolic_bp: 125,
        diastolic_bp: 80,
        oxygen_saturation: 98.0,
        temperature_celsius: 37.0,
        capillary_blood_glucose: null,
        recorded_by: 'staff-1',
        recorded_at: new Date(Date.now() - 30 * 60000).toISOString(),
      },
    ];

    // Acute deterioration: SpO2 dropped from 98% to 92%, HR rose from 85 to 115 bpm
    const output = TriageEngine.assess({
      patient_id: 'pt-delta-001',
      chief_complaint: 'Worsening dyspnea and racing heart',
      vitals: {
        heart_rate: 115,
        respiratory_rate: 24,
        systolic_bp: 110,
        diastolic_bp: 75,
        oxygen_saturation: 92.0,
      },
      symptom_vector: {
        respiratory: { accessory_muscle_use: true },
      },
      demographics: { age: 76 },
      medical_history: { severe_chronic_comorbidity: true },
      vitals_history: previousVitals,
    });

    expect(output.score_breakdown.s_delta).toBeGreaterThan(0);
    expect(output.calculated_category).toBe('HIGH');
  });

  it('validates TreeSHAP explainability feature attribution conforms to schema and low latency', () => {
    const output = TriageEngine.assess({
      patient_id: 'pt-xai-001',
      chief_complaint: 'Severe pressure in chest and sweating',
      vitals: {
        heart_rate: 118,
        respiratory_rate: 22,
        systolic_bp: 145,
        diastolic_bp: 92,
        oxygen_saturation: 94.0,
      },
      symptom_vector: {
        cardiac: {
          chest_pain_character: 'pressure',
          palpitations: true,
        },
      },
      demographics: { age: 72 },
      medical_history: { severe_chronic_comorbidity: true },
    });

    expect(output.explainability_payload.top_risk_drivers.length).toBeGreaterThan(0);
    expect(output.explainability_payload.model_version).toContain('TreeSHAP');
    expect(output.explainability_payload.latency_ms).toBeLessThan(100);

    const sumContributions = output.explainability_payload.top_risk_drivers.reduce(
      (sum, d) => sum + d.contribution_percent,
      0
    );
    expect(sumContributions).toBeGreaterThan(0);
  });
});
