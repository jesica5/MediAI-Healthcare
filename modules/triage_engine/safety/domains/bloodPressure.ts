/**
 * Domain 5: Blood Pressure Abnormalities
 * Rules:
 * - (SBP > 180 OR DBP > 120) WITH headache or chest pain
 * - OR SBP < 85 mmHg
 */
import { VitalsInput, SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateBloodPressureDomain(
  vitals: Partial<VitalsInput>,
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 5;
  const domainName = 'Blood Pressure Abnormalities';
  const clinicalFocus = 'Malignant hypertension, acute hypertensive crisis, circulatory shock';

  const sbp = vitals.systolic_bp ?? null;
  const dbp = vitals.diastolic_bp ?? null;
  const bpSymptoms = symptoms.blood_pressure as Record<string, unknown> | undefined;
  const cardiacSymptoms = symptoms.cardiac as Record<string, unknown> | undefined;

  const hasHeadache = !!bpSymptoms?.severe_headache;
  const hasChestPain = !!bpSymptoms?.chest_pain || !!cardiacSymptoms?.chest_pain_character;
  const hasTargetOrganSymptoms = hasHeadache || hasChestPain;

  // Hypertensive Crisis: (SBP > 180 or DBP > 120) WITH headache or chest pain
  if ((sbp !== null && sbp > 180) || (dbp !== null && dbp > 120)) {
    if (hasTargetOrganSymptoms) {
      flags.push({
        domain,
        domainName,
        ruleCode: 'BP_CRISIS_WITH_SYMPTOMS',
        observed: { sbp, dbp, headache: hasHeadache, chestPain: hasChestPain },
        threshold: '(SBP > 180 OR DBP > 120) WITH headache or chest pain',
        clinicalFocus: 'Malignant hypertension, acute hypertensive encephalopathy',
        message: `Tier-1 Red Flag [Domain 5 - Blood Pressure]: Hypertensive crisis (SBP: ${sbp ?? 'N/A'}, DBP: ${dbp ?? 'N/A'} mmHg with headache/chest pain).`,
      });
    }
  }

  // Severe Circulatory Collapse / Shock: SBP < 85 mmHg
  if (sbp !== null && sbp < 85) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'BP_SHOCK_SBP_LT_85',
      observed: sbp,
      threshold: 'SBP < 85 mmHg',
      clinicalFocus: 'Profound circulatory shock, hypovolemic / distributive collapse',
      message: `Tier-1 Red Flag [Domain 5 - Blood Pressure]: Profound hypotension and shock (SBP ${sbp} mmHg < 85 mmHg).`,
    });
  }

  return flags;
}
