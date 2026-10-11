// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { getMissingEssentialVitals } from '../schemas/vitals.schema';

describe('Missing Essential Vitals Detection Tests', () => {
  const completeVitals = {
    oxygen_saturation: 98.0,
    systolic_bp: 120,
    heart_rate: 72,
    respiratory_rate: 16,
    diastolic_bp: 80,
    temperature_celsius: 36.8,
    capillary_blood_glucose: 95.0,
  };

  it('returns empty array when all essential vitals (SpO2, SBP, HR) are present', () => {
    const missing = getMissingEssentialVitals(completeVitals);
    expect(missing).toEqual([]);
  });

  it('detects missing oxygen_saturation alone', () => {
    const missing = getMissingEssentialVitals({
      ...completeVitals,
      oxygen_saturation: null,
    });
    expect(missing).toEqual(['oxygen_saturation']);
  });

  it('detects missing systolic_bp alone', () => {
    const missing = getMissingEssentialVitals({
      ...completeVitals,
      systolic_bp: null,
    });
    expect(missing).toEqual(['systolic_bp']);
  });

  it('detects missing heart_rate alone', () => {
    const missing = getMissingEssentialVitals({
      ...completeVitals,
      heart_rate: null,
    });
    expect(missing).toEqual(['heart_rate']);
  });

  it('detects missing oxygen_saturation and systolic_bp pair', () => {
    const missing = getMissingEssentialVitals({
      ...completeVitals,
      oxygen_saturation: undefined,
      systolic_bp: null,
    });
    expect(missing).toEqual(['oxygen_saturation', 'systolic_bp']);
  });

  it('detects when all 3 essential vitals are missing/omitted', () => {
    const missing = getMissingEssentialVitals({
      respiratory_rate: 18,
      temperature_celsius: 37.0,
    });
    expect(missing).toEqual(['oxygen_saturation', 'systolic_bp', 'heart_rate']);
  });

  it('ignores non-essential missing vitals', () => {
    const missing = getMissingEssentialVitals({
      oxygen_saturation: 99.0,
      systolic_bp: 118,
      heart_rate: 68,
      temperature_celsius: null,
      capillary_blood_glucose: null,
      respiratory_rate: null,
    });
    expect(missing).toEqual([]);
  });
});
