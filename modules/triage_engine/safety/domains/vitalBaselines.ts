/**
 * Cross-Category Vital Emergency Baselines
 * Implements standalone physiological red-flag boundaries (Specification Section 5).
 * 
 * Strict Thresholds:
 * - HR   : < 40 or > 150 bpm
 * - RR   : < 8 or > 32 bpm
 * - SBP  : < 85 or > 180 mmHg
 * - DBP  : > 120 mmHg
 * - SpO2 : < 90% on room air
 * - Temp : < 35.0 C or > 40.0 C
 * - CBG  : < 60 or > 400 mg/dL
 */
import { VitalsInput } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateVitalBaselines(vitals: Partial<VitalsInput>): RedFlagItem[] {
  const flags: RedFlagItem[] = [];

  const hr = vitals.heart_rate ?? null;
  const rr = vitals.respiratory_rate ?? null;
  const sbp = vitals.systolic_bp ?? null;
  const dbp = vitals.diastolic_bp ?? null;
  const spo2 = vitals.oxygen_saturation ?? null;
  const temp = vitals.temperature_celsius ?? null;
  const cbg = vitals.capillary_blood_glucose ?? null;

  // HR < 40 or > 150
  if (hr !== null) {
    if (hr < 40) {
      flags.push({
        domain: 3,
        domainName: 'Cardiac Warning Signs',
        ruleCode: 'VITAL_HR_CRITICAL_LOW',
        observed: hr,
        threshold: 'HR < 40 bpm',
        clinicalFocus: 'Severe bradycardia / sinus arrest',
        message: `Cross-Category Vital Critical: Heart rate (${hr} bpm < 40 bpm). Severe bradycardia.`,
      });
    } else if (hr > 150) {
      flags.push({
        domain: 3,
        domainName: 'Cardiac Warning Signs',
        ruleCode: 'VITAL_HR_CRITICAL_HIGH',
        observed: hr,
        threshold: 'HR > 150 bpm',
        clinicalFocus: 'Severe tachyarrhythmia / ventricular rate',
        message: `Cross-Category Vital Critical: Heart rate (${hr} bpm > 150 bpm). Malignant tachycardia.`,
      });
    }
  }

  // RR < 8 or > 32
  if (rr !== null) {
    if (rr < 8) {
      flags.push({
        domain: 2,
        domainName: 'Respiratory Warning Signs',
        ruleCode: 'VITAL_RR_CRITICAL_LOW',
        observed: rr,
        threshold: 'RR < 8 bpm',
        clinicalFocus: 'Severe hypoventilation, impending respiratory arrest',
        message: `Cross-Category Vital Critical: Respiratory rate (${rr} bpm < 8 bpm). Impending arrest.`,
      });
    } else if (rr > 32) {
      flags.push({
        domain: 2,
        domainName: 'Respiratory Warning Signs',
        ruleCode: 'VITAL_RR_CRITICAL_HIGH',
        observed: rr,
        threshold: 'RR > 32 bpm',
        clinicalFocus: 'Extreme tachypnea / acute respiratory distress',
        message: `Cross-Category Vital Critical: Respiratory rate (${rr} bpm > 32 bpm). Acute severe tachypnea.`,
      });
    }
  }

  // SBP < 85 or > 180
  if (sbp !== null) {
    if (sbp < 85) {
      flags.push({
        domain: 5,
        domainName: 'Blood Pressure Abnormalities',
        ruleCode: 'VITAL_SBP_CRITICAL_LOW',
        observed: sbp,
        threshold: 'SBP < 85 mmHg',
        clinicalFocus: 'Severe hypotensive shock',
        message: `Cross-Category Vital Critical: Systolic blood pressure (${sbp} mmHg < 85 mmHg). Decompensated shock.`,
      });
    } else if (sbp > 180) {
      flags.push({
        domain: 5,
        domainName: 'Blood Pressure Abnormalities',
        ruleCode: 'VITAL_SBP_CRITICAL_HIGH',
        observed: sbp,
        threshold: 'SBP > 180 mmHg',
        clinicalFocus: 'Severe systolic hypertensive crisis',
        message: `Cross-Category Vital Critical: Systolic blood pressure (${sbp} mmHg > 180 mmHg). Severe hypertensive crisis.`,
      });
    }
  }

  // DBP > 120
  if (dbp !== null && dbp > 120) {
    flags.push({
      domain: 5,
      domainName: 'Blood Pressure Abnormalities',
      ruleCode: 'VITAL_DBP_CRITICAL_HIGH',
      observed: dbp,
      threshold: 'DBP > 120 mmHg',
      clinicalFocus: 'Severe diastolic hypertensive crisis',
      message: `Cross-Category Vital Critical: Diastolic blood pressure (${dbp} mmHg > 120 mmHg). Malignant hypertension.`,
    });
  }

  // SpO2 < 90%
  if (spo2 !== null && spo2 < 90.0) {
    flags.push({
      domain: 2,
      domainName: 'Respiratory Warning Signs',
      ruleCode: 'VITAL_SPO2_CRITICAL_LOW',
      observed: spo2,
      threshold: 'SpO2 < 90%',
      clinicalFocus: 'Critical hypoxemia',
      message: `Cross-Category Vital Critical: Oxygen saturation (${spo2}% < 90%). Critical hypoxemia.`,
    });
  }

  // Temp < 35.0 C or > 40.0 C
  if (temp !== null) {
    if (temp < 35.0) {
      flags.push({
        domain: 1,
        domainName: 'General Infections & Sepsis',
        ruleCode: 'VITAL_TEMP_CRITICAL_LOW',
        observed: temp,
        threshold: 'Temp < 35.0 C',
        clinicalFocus: 'Severe hypothermia',
        message: `Cross-Category Vital Critical: Core temperature (${temp}°C < 35.0°C). Severe hypothermia.`,
      });
    } else if (temp > 40.0) {
      flags.push({
        domain: 1,
        domainName: 'General Infections & Sepsis',
        ruleCode: 'VITAL_TEMP_CRITICAL_HIGH',
        observed: temp,
        threshold: 'Temp > 40.0 C',
        clinicalFocus: 'Malignant hyperpyrexia',
        message: `Cross-Category Vital Critical: Core temperature (${temp}°C > 40.0°C). Malignant hyperpyrexia.`,
      });
    }
  }

  // CBG < 60 or > 400 mg/dL
  if (cbg !== null) {
    if (cbg < 60) {
      flags.push({
        domain: 6,
        domainName: 'Diabetes-Related Risks',
        ruleCode: 'VITAL_CBG_CRITICAL_LOW',
        observed: cbg,
        threshold: 'CBG < 60 mg/dL',
        clinicalFocus: 'Severe neuroglycopenia',
        message: `Cross-Category Vital Critical: Capillary blood glucose (${cbg} mg/dL < 60 mg/dL). Severe hypoglycemia.`,
      });
    } else if (cbg > 400) {
      flags.push({
        domain: 6,
        domainName: 'Diabetes-Related Risks',
        ruleCode: 'VITAL_CBG_CRITICAL_HIGH',
        observed: cbg,
        threshold: 'CBG > 400 mg/dL',
        clinicalFocus: 'Severe hyperglycemic hyperosmolar state',
        message: `Cross-Category Vital Critical: Capillary blood glucose (${cbg} mg/dL > 400 mg/dL). Severe hyperglycemia.`,
      });
    }
  }

  return flags;
}
