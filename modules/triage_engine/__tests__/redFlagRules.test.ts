import { describe, it, expect } from 'vitest';
import { evaluateClinicalRedFlags } from '../safety/redFlagRules';
import { SymptomVector, VitalsInput } from '@/modules/patient_intake/types';

describe('Deterministic 12-Domain Red-Flag Safety Engine', () => {
  const emptySymptoms: SymptomVector = {};
  const normalVitals: Partial<VitalsInput> = {
    heart_rate: 72,
    respiratory_rate: 16,
    systolic_bp: 118,
    diastolic_bp: 76,
    oxygen_saturation: 98.0,
    temperature_celsius: 36.8,
    capillary_blood_glucose: 95.0,
  };

  it('Baseline check: should NOT trigger any red flag on normal physiological vitals and symptoms', () => {
    const result = evaluateClinicalRedFlags(normalVitals, emptySymptoms);
    expect(result.hasRedFlag).toBe(false);
    expect(result.domainNumber).toBeNull();
    expect(result.triggeredFlags).toHaveLength(0);
  });

  // Domain 1: General Infections & Sepsis
  describe('Domain 1: General Infections & Sepsis', () => {
    it('triggers Tier-1 red flag when qSOFA score >= 2 (RR >= 22, SBP <= 100, altered mentation)', () => {
      const vitals: Partial<VitalsInput> = {
        ...normalVitals,
        respiratory_rate: 24,
        systolic_bp: 95,
      };
      const symptoms: SymptomVector = {
        infection_sepsis: { altered_mentation: true },
      };
      const result = evaluateClinicalRedFlags(vitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(1);
      expect(result.domainName).toContain('Sepsis');
      expect(result.clinicalFocus).toContain('Septic shock');
    });

    it('triggers Tier-1 red flag on core hypothermia (< 35.0°C)', () => {
      const vitals: Partial<VitalsInput> = {
        ...normalVitals,
        temperature_celsius: 34.2,
      };
      const result = evaluateClinicalRedFlags(vitals, emptySymptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(1);
      expect(result.triggeredFlags[0]).toContain('hypothermia');
    });
  });

  // Domain 2: Respiratory Warning Signs
  describe('Domain 2: Respiratory Warning Signs', () => {
    it('triggers Tier-1 red flag on severe hypoxemia (SpO2 < 90%)', () => {
      const vitals: Partial<VitalsInput> = {
        ...normalVitals,
        oxygen_saturation: 87.5,
      };
      const result = evaluateClinicalRedFlags(vitals, emptySymptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(2);
      expect(result.clinicalFocus).toContain('respiratory distress');
    });

    it('triggers Tier-1 red flag on extreme tachypnea (RR > 32) and bradypnea (RR < 8)', () => {
      const resultHigh = evaluateClinicalRedFlags({ ...normalVitals, respiratory_rate: 36 }, emptySymptoms);
      expect(resultHigh.hasRedFlag).toBe(true);
      expect(resultHigh.domainNumber).toBe(2);

      const resultLow = evaluateClinicalRedFlags({ ...normalVitals, respiratory_rate: 6 }, emptySymptoms);
      expect(resultLow.hasRedFlag).toBe(true);
      expect(resultLow.domainNumber).toBe(2);
    });

    it('triggers Tier-1 red flag on audible upper airway stridor', () => {
      const symptoms: SymptomVector = {
        respiratory: { stridor: true },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(2);
      expect(result.triggeredFlags[0]).toContain('stridor');
    });
  });

  // Domain 3: Cardiac Warning Signs
  describe('Domain 3: Cardiac Warning Signs', () => {
    it('triggers Tier-1 red flag on crushing retrosternal pain radiating to left arm / jaw (ACS)', () => {
      const symptoms: SymptomVector = {
        cardiac: {
          chest_pain_character: 'pressure',
          radiation: 'left_arm',
        },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(3);
      expect(result.clinicalFocus).toContain('Acute Coronary Syndrome');
    });

    it('triggers Tier-1 red flag on extreme tachycardia (HR > 150) and severe bradycardia (HR < 40)', () => {
      const resultFast = evaluateClinicalRedFlags({ ...normalVitals, heart_rate: 165 }, emptySymptoms);
      expect(resultFast.hasRedFlag).toBe(true);
      expect(resultFast.domainNumber).toBe(3);

      const resultSlow = evaluateClinicalRedFlags({ ...normalVitals, heart_rate: 34 }, emptySymptoms);
      expect(resultSlow.hasRedFlag).toBe(true);
      expect(resultSlow.domainNumber).toBe(3);
    });
  });

  // Domain 4: Neurological Warning Signs
  describe('Domain 4: Neurological Warning Signs', () => {
    it('triggers Tier-1 red flag on acute focal neurological deficit (FAST criteria)', () => {
      const symptoms: SymptomVector = {
        neurological: { fast_facial_droop: true },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(4);
      expect(result.clinicalFocus).toContain('ischemic stroke');
    });

    it('triggers Tier-1 red flag on GCS score < 12', () => {
      const symptoms: SymptomVector = {
        neurological: { gcs_score: 9 },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(4);
    });

    it('triggers Tier-1 red flag on active seizures / status epilepticus', () => {
      const symptoms: SymptomVector = {
        neurological: { seizures: true },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(4);
    });
  });

  // Domain 5: Blood Pressure Abnormalities
  describe('Domain 5: Blood Pressure Abnormalities', () => {
    it('triggers Tier-1 red flag on hypertensive crisis (SBP > 180 or DBP > 120 with severe headache)', () => {
      const vitals: Partial<VitalsInput> = {
        ...normalVitals,
        systolic_bp: 195,
        diastolic_bp: 125,
      };
      const symptoms: SymptomVector = {
        blood_pressure: { severe_headache: true },
      };
      const result = evaluateClinicalRedFlags(vitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(5);
      expect(result.clinicalFocus).toContain('hypertension');
    });

    it('triggers Tier-1 red flag on profound shock (SBP < 85 mmHg)', () => {
      const vitals: Partial<VitalsInput> = {
        ...normalVitals,
        systolic_bp: 78,
      };
      const result = evaluateClinicalRedFlags(vitals, emptySymptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(5);
      expect(result.clinicalFocus).toContain('shock');
    });
  });

  // Domain 6: Diabetes-Related Risks
  describe('Domain 6: Diabetes-Related Risks', () => {
    it('triggers Tier-1 red flag on severe hypoglycemia (CBG < 60 with altered mentation)', () => {
      const vitals: Partial<VitalsInput> = {
        ...normalVitals,
        capillary_blood_glucose: 42.0,
      };
      const symptoms: SymptomVector = {
        infection_sepsis: { altered_mentation: true },
      };
      const result = evaluateClinicalRedFlags(vitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(6);
      expect(result.clinicalFocus).toContain('hypoglycemic coma');
    });

    it('triggers Tier-1 red flag on severe hyperglycemia (CBG > 400 with Kussmaul breathing)', () => {
      const vitals: Partial<VitalsInput> = {
        ...normalVitals,
        capillary_blood_glucose: 450.0,
      };
      const symptoms: SymptomVector = {
        diabetes: { kussmaul_breathing: true },
      };
      const result = evaluateClinicalRedFlags(vitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(6);
      expect(result.clinicalFocus).toContain('DKA');
    });
  });

  // Domain 7: Gastrointestinal Issues
  describe('Domain 7: Gastrointestinal Issues', () => {
    it('triggers Tier-1 red flag on massive hematemesis', () => {
      const symptoms: SymptomVector = {
        gastrointestinal: { emesis: 'hematemesis' },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(7);
      expect(result.clinicalFocus).toContain('upper GI hemorrhage');
    });

    it('triggers Tier-1 red flag on peritoneal rebound tenderness / involuntary rigidity', () => {
      const symptoms: SymptomVector = {
        gastrointestinal: { rebound_tenderness: true },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(7);
      expect(result.clinicalFocus).toContain('Perforated hollow viscus');
    });

    it('triggers Tier-1 red flag on melena with hemodynamic instability (SBP < 90)', () => {
      const vitals: Partial<VitalsInput> = {
        ...normalVitals,
        systolic_bp: 88,
      };
      const symptoms: SymptomVector = {
        gastrointestinal: { stool_color: 'melena' },
      };
      const result = evaluateClinicalRedFlags(vitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(7);
    });
  });

  // Domain 8: Injury & Trauma
  describe('Domain 8: Injury & Trauma', () => {
    it('triggers Tier-1 red flag on pulsatile arterial hemorrhage', () => {
      const symptoms: SymptomVector = {
        injury_trauma: { bleeding_rate: 'pulsatile' },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(8);
      expect(result.clinicalFocus).toContain('Exsanguinating arterial hemorrhage');
    });

    it('triggers Tier-1 red flag on obstructed airway', () => {
      const symptoms: SymptomVector = {
        injury_trauma: { airway_patency: 'obstructed' },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(8);
      expect(result.clinicalFocus).toContain('asphyxiation');
    });
  });

  // Domain 9: Pregnancy-Related Risks
  describe('Domain 9: Pregnancy-Related Risks', () => {
    it('triggers Tier-1 red flag on vaginal hemorrhage at >= 20 weeks gestational age', () => {
      const symptoms: SymptomVector = {
        pregnancy: {
          gestational_age_weeks: 32,
          vaginal_bleeding: true,
        },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms, { pregnancy_status: 'pregnant' });
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(9);
      expect(result.clinicalFocus).toContain('Placental abruption');
    });

    it('triggers Tier-1 red flag on severe headache/epigastric pain with hypertension in pregnancy', () => {
      const vitals: Partial<VitalsInput> = {
        ...normalVitals,
        systolic_bp: 168,
      };
      const symptoms: SymptomVector = {
        pregnancy: {
          gestational_age_weeks: 34,
          severe_headache: true,
          pelvic_pain: true,
        },
      };
      const result = evaluateClinicalRedFlags(vitals, symptoms, { pregnancy_status: 'pregnant' });
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(9);
      expect(result.clinicalFocus).toContain('pre-eclampsia');
    });
  });

  // Domain 10: Allergic Reactions
  describe('Domain 10: Allergic Reactions', () => {
    it('triggers Tier-1 red flag on mucosal swelling / angioedema with voice change', () => {
      const symptoms: SymptomVector = {
        allergic: {
          mucosal_swelling: true,
          voice_change: true,
        },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(10);
      expect(result.clinicalFocus).toContain('fatal airway closure');
    });

    it('triggers Tier-1 red flag on bronchospastic wheeze combined with systemic hypotension', () => {
      const vitals: Partial<VitalsInput> = {
        ...normalVitals,
        systolic_bp: 82,
      };
      const symptoms: SymptomVector = {
        allergic: { wheeze: true },
      };
      const result = evaluateClinicalRedFlags(vitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.triggeredDomains).toContain(10);
      expect(result.triggeredFlags.some(f => f.includes('[Domain 10 - Allergic]'))).toBe(true);
      expect(result.triggeredFlags.some(f => f.includes('Anaphylactic shock'))).toBe(true);
    });
  });

  // Domain 11: Dehydration & Fluid Balance
  describe('Domain 11: Dehydration & Fluid Balance', () => {
    it('triggers Tier-1 red flag on complete anuria', () => {
      const symptoms: SymptomVector = {
        dehydration: { urine_output: 'none' },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(11);
      expect(result.clinicalFocus).toContain('renal failure');
    });

    it('triggers Tier-1 red flag on tented skin turgor with delayed capillary refill (> 4s)', () => {
      const symptoms: SymptomVector = {
        dehydration: {
          skin_turgor: 'tented',
          capillary_refill_seconds: 5.5,
        },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(11);
      expect(result.clinicalFocus).toContain('hypovolemic');
    });
  });

  // Domain 12: Multi-System / Toxic Exposure
  describe('Domain 12: Multi-System / Toxic Exposure', () => {
    it('triggers Tier-1 red flag on SLUDGE toxidrome (excessive salivation + pinpoint pupils)', () => {
      const symptoms: SymptomVector = {
        toxic_exposure: {
          salivation: 'excessive',
          pupil_size: 'pinpoint',
        },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.domainNumber).toBe(12);
      expect(result.clinicalFocus).toContain('organophosphate');
    });

    it('triggers Tier-1 red flag on puncture venomous bite with descending neuro deficit', () => {
      const symptoms: SymptomVector = {
        toxic_exposure: { puncture_marks: true },
        neurological: { fast_facial_droop: true },
      };
      const result = evaluateClinicalRedFlags(normalVitals, symptoms);
      expect(result.hasRedFlag).toBe(true);
      expect(result.triggeredDomains).toContain(12);
      expect(result.triggeredFlags.some(f => f.includes('[Domain 12 - Toxic Exposure]'))).toBe(true);
      expect(result.triggeredFlags.some(f => f.includes('Neurotoxic envenomation'))).toBe(true);
    });
  });
});
