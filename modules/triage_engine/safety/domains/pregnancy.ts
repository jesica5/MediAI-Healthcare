/**
 * Domain 9: Pregnancy-Related Risks
 * Rules (Gestational age > 20 weeks):
 * - Third-trimester vaginal hemorrhage
 * - Severe epigastric pain WITH visual aura
 * - Eclamptic convulsions
 */
import { VitalsInput, SymptomVector, MedicalHistory } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluatePregnancyDomain(
  vitals: Partial<VitalsInput>,
  symptoms: SymptomVector,
  history?: Partial<MedicalHistory>
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 9;
  const domainName = 'Pregnancy-Related Risks';
  const clinicalFocus = 'Placental abruption, severe pre-eclampsia, eclamptic seizures, maternal-fetal death';

  const sbp = vitals.systolic_bp ?? null;
  const preg = symptoms.pregnancy as Record<string, unknown> | undefined;
  const neuro = symptoms.neurological as Record<string, unknown> | undefined;

  const isPregnant =
    history?.pregnancy_status === 'pregnant' ||
    (preg?.gestational_age_weeks !== undefined && preg?.gestational_age_weeks !== null);

  if (!isPregnant) return flags;

  const gestWeeks = typeof preg?.gestational_age_weeks === 'number' ? preg.gestational_age_weeks : 0;
  const isPost20Weeks = gestWeeks > 20;

  // Third-trimester / Late-pregnancy Vaginal Hemorrhage (> 20 wks)
  if (isPost20Weeks && preg?.vaginal_bleeding) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'PREG_HEMORRHAGE_THIRD_TRIMESTER',
      observed: { gestWeeks, vaginal_bleeding: true },
      threshold: 'Gestational age > 20 wks WITH vaginal hemorrhage',
      clinicalFocus: 'Placental abruption, placenta previa, maternal-fetal exsanguination',
      message: `Tier-1 Red Flag [Domain 9 - Pregnancy]: Vaginal hemorrhage in late pregnancy (${gestWeeks} weeks). Suspected placental abruption.`,
    });
  }

  // Severe Pre-eclampsia: (Severe headache or SBP >= 160) WITH (epigastric/pelvic pain or visual aura)
  const hasAura = !!preg?.visual_aura;
  const hasEpigastricOrPelvic = !!preg?.pelvic_pain || !!preg?.epigastric_pain;
  const hasSevereCephalgia = !!preg?.severe_headache;
  const isSevereHypertensive = sbp !== null && sbp >= 160;

  if (
    isPost20Weeks &&
    (hasSevereCephalgia || isSevereHypertensive) &&
    (hasEpigastricOrPelvic || hasAura)
  ) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'PREG_PREECLAMPSIA_AURA',
      observed: { gestWeeks, sbp, hasSevereCephalgia, hasAura },
      threshold: 'Gestational age > 20 wks WITH hypertension/headache AND epigastric/pelvic pain or visual aura',
      clinicalFocus: 'Severe pre-eclampsia, impending eclamptic seizures',
      message: `Tier-1 Red Flag [Domain 9 - Pregnancy]: Severe hypertension/headache with pelvic/epigastric pain or visual aura in pregnancy (${gestWeeks} weeks). Impending eclampsia alert.`,
    });
  }

  // Eclamptic Convulsions
  const hasConvulsions = !!preg?.convulsions || !!neuro?.seizures;
  if (isPost20Weeks && hasConvulsions) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'PREG_ECLAMPSIA_SEIZURE',
      observed: { gestWeeks, convulsions: true },
      threshold: 'Gestational age > 20 wks WITH eclamptic convulsions',
      clinicalFocus: 'Eclampsia, active maternal-fetal seizure crisis',
      message: `Tier-1 Red Flag [Domain 9 - Pregnancy]: Eclamptic convulsions in pregnancy (${gestWeeks} weeks). Critical maternal-fetal emergency.`,
    });
  }

  return flags;
}
