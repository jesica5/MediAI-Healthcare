/**
 * Multi-Parameter Vital Signs Deviation Scoring Engine
 * Computes S_vitals in [0, 100] based on Cross-Category Vital Signs Safety Baselines (Specification Section 6).
 */
import { VitalsInput } from '@/modules/patient_intake/types';
import { VitalScoreResult } from '../types';

export function calculateVitalDeviationScore(vitals: Partial<VitalsInput>): VitalScoreResult {
  let score = 0;
  const abnormalities: string[] = [];
  let severelyAbnormalCount = 0;
  let moderatelyAbnormalCount = 0;

  const hr = vitals.heart_rate ?? null;
  const rr = vitals.respiratory_rate ?? null;
  const sbp = vitals.systolic_bp ?? null;
  const dbp = vitals.diastolic_bp ?? null;
  const spo2 = vitals.oxygen_saturation ?? null;
  const temp = vitals.temperature_celsius ?? null;
  const cbg = vitals.capillary_blood_glucose ?? null;

  // 1. Heart Rate (HR): normal 50-100 bpm
  if (hr !== null) {
    if (hr < 40 || hr > 150) {
      score += 25;
      severelyAbnormalCount++;
      abnormalities.push(`Critical Heart Rate: ${hr} bpm (threshold <40 or >150)`);
    } else if ((hr >= 40 && hr < 50) || (hr >= 110 && hr <= 149)) {
      score += 12;
      moderatelyAbnormalCount++;
      abnormalities.push(`Abnormal Heart Rate: ${hr} bpm (threshold 40-49 or 110-149)`);
    }
  }

  // 2. Respiratory Rate (RR): normal 12-20 bpm
  if (rr !== null) {
    if (rr < 8 || rr > 32) {
      score += 25;
      severelyAbnormalCount++;
      abnormalities.push(`Critical Respiratory Rate: ${rr} bpm (threshold <8 or >32)`);
    } else if (rr >= 22 && rr <= 32) {
      score += 12;
      moderatelyAbnormalCount++;
      abnormalities.push(`Elevated Respiratory Rate: ${rr} bpm (threshold 22-32)`);
    }
  }

  // 3. Systolic BP (SBP): normal 90-120 mmHg
  if (sbp !== null) {
    if (sbp < 85 || sbp > 180) {
      score += 25;
      severelyAbnormalCount++;
      abnormalities.push(`Critical Systolic BP: ${sbp} mmHg (threshold <85 or >180)`);
    } else if ((sbp >= 85 && sbp < 90) || (sbp >= 140 && sbp <= 179)) {
      score += 12;
      moderatelyAbnormalCount++;
      abnormalities.push(`Abnormal Systolic BP: ${sbp} mmHg (threshold 85-89 or 140-179)`);
    }
  }

  // 4. Diastolic BP (DBP): normal 60-80 mmHg
  if (dbp !== null) {
    if (dbp > 120) {
      score += 15;
      severelyAbnormalCount++;
      abnormalities.push(`Critical Diastolic BP: ${dbp} mmHg (threshold >120)`);
    } else if (dbp >= 90 && dbp <= 119) {
      score += 8;
      moderatelyAbnormalCount++;
      abnormalities.push(`Elevated Diastolic BP: ${dbp} mmHg (threshold 90-119)`);
    }
  }

  // 5. Oxygen Saturation (SpO2): normal 95-100%
  if (spo2 !== null) {
    if (spo2 < 90.0) {
      score += 30;
      severelyAbnormalCount++;
      abnormalities.push(`Critical Hypoxemia: SpO2 ${spo2}% (threshold <90%)`);
    } else if (spo2 >= 90.0 && spo2 < 94.0) {
      score += 15;
      moderatelyAbnormalCount++;
      abnormalities.push(`Reduced SpO2: ${spo2}% (threshold 90-93%)`);
    }
  }

  // 6. Body Temperature: normal 36.5 - 37.5°C
  if (temp !== null) {
    if (temp < 35.0 || temp > 40.0) {
      score += 20;
      severelyAbnormalCount++;
      abnormalities.push(`Critical Temperature: ${temp}°C (threshold <35.0 or >40.0)`);
    } else if ((temp >= 35.0 && temp < 36.0) || (temp >= 38.3 && temp <= 39.9)) {
      score += 10;
      moderatelyAbnormalCount++;
      abnormalities.push(`Fever / Hypothermia Warning: ${temp}°C`);
    }
  }

  // 7. Capillary Blood Glucose (CBG): normal 70-140 mg/dL
  if (cbg !== null) {
    if (cbg < 60 || cbg > 400) {
      score += 20;
      severelyAbnormalCount++;
      abnormalities.push(`Critical Glucose: ${cbg} mg/dL (threshold <60 or >400)`);
    } else if ((cbg >= 60 && cbg < 70) || (cbg >= 200 && cbg <= 399)) {
      score += 10;
      moderatelyAbnormalCount++;
      abnormalities.push(`Abnormal Glucose: ${cbg} mg/dL`);
    }
  }

  // Scale and clamp score to 0 - 100
  const normalizedScore = Math.min(100, Math.max(0, score));

  return {
    score: normalizedScore,
    abnormalities,
    severelyAbnormalCount,
    moderatelyAbnormalCount,
  };
}
