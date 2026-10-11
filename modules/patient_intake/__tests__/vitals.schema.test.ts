import { describe, it, expect } from 'vitest';
import { vitalsInputSchema } from '../schemas/vitals.schema';

describe('Vitals Schema Boundary & Validation Tests', () => {
  const validBaseline = {
    heart_rate: 75,
    respiratory_rate: 16,
    systolic_bp: 120,
    diastolic_bp: 80,
    oxygen_saturation: 98.0,
    temperature_celsius: 37.0,
    capillary_blood_glucose: 100.0,
  };

  it('accepts valid baseline vitals', () => {
    const result = vitalsInputSchema.safeParse(validBaseline);
    expect(result.success).toBe(true);
  });

  it('accepts null and omitted values for individual vitals', () => {
    const result = vitalsInputSchema.safeParse({
      heart_rate: null,
      respiratory_rate: null,
      systolic_bp: null,
      diastolic_bp: null,
      oxygen_saturation: null,
      temperature_celsius: null,
      capillary_blood_glucose: null,
    });
    expect(result.success).toBe(true);

    const emptyResult = vitalsInputSchema.safeParse({});
    expect(emptyResult.success).toBe(true);
  });

  describe('heart_rate boundaries (20-300 bpm)', () => {
    it('accepts min (20) and max (300)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, heart_rate: 20 }).success).toBe(true);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, heart_rate: 300 }).success).toBe(true);
    });

    it('rejects min - 1 (19) and max + 1 (301)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, heart_rate: 19 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, heart_rate: 301 }).success).toBe(false);
    });

    it('rejects non-integer, negative, NaN, non-numeric', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, heart_rate: 75.5 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, heart_rate: -10 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, heart_rate: NaN }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, heart_rate: '75' as unknown as number }).success).toBe(false);
    });
  });

  describe('respiratory_rate boundaries (4-80 breaths/min)', () => {
    it('accepts min (4) and max (80)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, respiratory_rate: 4 }).success).toBe(true);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, respiratory_rate: 80 }).success).toBe(true);
    });

    it('rejects min - 1 (3) and max + 1 (81)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, respiratory_rate: 3 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, respiratory_rate: 81 }).success).toBe(false);
    });

    it('rejects non-integer, negative, NaN', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, respiratory_rate: 16.2 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, respiratory_rate: -4 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, respiratory_rate: NaN }).success).toBe(false);
    });
  });

  describe('systolic_bp boundaries (40-300 mmHg)', () => {
    it('accepts min (40) and max (300)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: 40, diastolic_bp: 30 }).success).toBe(true);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: 300, diastolic_bp: 150 }).success).toBe(true);
    });

    it('rejects min - 1 (39) and max + 1 (301)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: 39, diastolic_bp: 30 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: 301, diastolic_bp: 150 }).success).toBe(false);
    });

    it('rejects non-integer, negative, NaN', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: 120.5 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: -120 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: NaN }).success).toBe(false);
    });
  });

  describe('diastolic_bp boundaries (20-200 mmHg)', () => {
    it('accepts min (20) and max (200)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: 100, diastolic_bp: 20 }).success).toBe(true);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: 220, diastolic_bp: 200 }).success).toBe(true);
    });

    it('rejects min - 1 (19) and max + 1 (201)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: 100, diastolic_bp: 19 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: 220, diastolic_bp: 201 }).success).toBe(false);
    });

    it('rejects non-integer, negative, NaN', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, diastolic_bp: 80.5 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, diastolic_bp: -80 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, diastolic_bp: NaN }).success).toBe(false);
    });
  });

  describe('Blood Pressure Combination Logic: DBP < SBP', () => {
    it('rejects DBP equal to SBP', () => {
      const result = vitalsInputSchema.safeParse({
        ...validBaseline,
        systolic_bp: 120,
        diastolic_bp: 120,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/lower than systolic/i);
      }
    });

    it('rejects DBP greater than SBP', () => {
      const result = vitalsInputSchema.safeParse({
        ...validBaseline,
        systolic_bp: 110,
        diastolic_bp: 120,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/lower than systolic/i);
      }
    });

    it('accepts when one or both BP fields are null', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: 120, diastolic_bp: null }).success).toBe(true);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, systolic_bp: null, diastolic_bp: 80 }).success).toBe(true);
    });
  });

  describe('oxygen_saturation boundaries (40.0-100.0 %, max 1 decimal)', () => {
    it('accepts min (40.0) and max (100.0)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, oxygen_saturation: 40.0 }).success).toBe(true);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, oxygen_saturation: 100.0 }).success).toBe(true);
    });

    it('rejects min - 0.1 (39.9) and max + 0.1 (100.1)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, oxygen_saturation: 39.9 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, oxygen_saturation: 100.1 }).success).toBe(false);
    });

    it('rejects more than 1 decimal place', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, oxygen_saturation: 98.55 }).success).toBe(false);
    });

    it('rejects negative, NaN', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, oxygen_saturation: -50 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, oxygen_saturation: NaN }).success).toBe(false);
    });
  });

  describe('temperature_celsius boundaries (30.00-45.00 C, max 2 decimals)', () => {
    it('accepts min (30.00) and max (45.00)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, temperature_celsius: 30.00 }).success).toBe(true);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, temperature_celsius: 45.00 }).success).toBe(true);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, temperature_celsius: 37.25 }).success).toBe(true);
    });

    it('rejects min - 0.01 (29.99) and max + 0.01 (45.01)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, temperature_celsius: 29.99 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, temperature_celsius: 45.01 }).success).toBe(false);
    });

    it('rejects more than 2 decimal places', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, temperature_celsius: 37.125 }).success).toBe(false);
    });

    it('rejects negative, NaN', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, temperature_celsius: -35 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, temperature_celsius: NaN }).success).toBe(false);
    });
  });

  describe('capillary_blood_glucose boundaries (provisional 20.0-800.0 mg/dL, max 1 decimal)', () => {
    it('accepts min (20.0) and max (800.0)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, capillary_blood_glucose: 20.0 }).success).toBe(true);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, capillary_blood_glucose: 800.0 }).success).toBe(true);
    });

    it('rejects min - 0.1 (19.9) and max + 0.1 (800.1)', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, capillary_blood_glucose: 19.9 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, capillary_blood_glucose: 800.1 }).success).toBe(false);
    });

    it('rejects more than 1 decimal place', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, capillary_blood_glucose: 105.25 }).success).toBe(false);
    });

    it('rejects negative, NaN', () => {
      expect(vitalsInputSchema.safeParse({ ...validBaseline, capillary_blood_glucose: -10 }).success).toBe(false);
      expect(vitalsInputSchema.safeParse({ ...validBaseline, capillary_blood_glucose: NaN }).success).toBe(false);
    });
  });

  it('enforces strict mode: rejects unknown fields in vitals', () => {
    const result = vitalsInputSchema.safeParse({
      ...validBaseline,
      extra_unauthorized_field: 42,
    });
    expect(result.success).toBe(false);
  });
});
