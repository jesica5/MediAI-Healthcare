/**
 * Domain 1: General Infections & Sepsis
 * Rules:
 * - qSOFA >= 2 of { RR >= 22 bpm, SBP <= 100 mmHg, altered mentation }
 * - OR core temp < 35.0 C (hypothermia)
 * - OR core temp > 40.0 C (malignant hyperpyrexia)
 */
import { VitalsInput, SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateSepsisDomain(
  vitals: Partial<VitalsInput>,
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 1;
  const domainName = 'General Infections & Sepsis';
  const clinicalFocus = 'Septic shock, systemic inflammatory response syndrome (SIRS)';

  const rr = vitals.respiratory_rate ?? null;
  const sbp = vitals.systolic_bp ?? null;
  const temp = vitals.temperature_celsius ?? null;
  const alteredMentation = !!symptoms.infection_sepsis?.altered_mentation;

  // qSOFA Calculation
  let qsofaScore = 0;
  if (rr !== null && rr >= 22) qsofaScore++;
  if (sbp !== null && sbp <= 100) qsofaScore++;
  if (alteredMentation) qsofaScore++;

  if (qsofaScore >= 2) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'SEPSIS_QSOFA_GE_2',
      observed: { qsofaScore, rr, sbp, alteredMentation },
      threshold: 'qSOFA >= 2 of {RR >= 22, SBP <= 100, altered mentation}',
      clinicalFocus,
      message: `Tier-1 Red Flag [Domain 1 - Sepsis]: qSOFA score >= 2 (RR: ${rr ?? 'N/A'}, SBP: ${sbp ?? 'N/A'}, altered mentation: ${alteredMentation}). High septic shock risk.`,
    });
  }

  // Core Hypothermia: temp < 35.0 C
  if (temp !== null && temp < 35.0) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'SEPSIS_TEMP_LT_35',
      observed: temp,
      threshold: 'Temp < 35.0 C',
      clinicalFocus: 'Severe hypothermic sepsis, metabolic collapse',
      message: `Tier-1 Red Flag [Domain 1 - Sepsis]: Core hypothermia (${temp}°C < 35.0°C). Severe sepsis / metabolic collapse.`,
    });
  }

  // Severe Hyperpyrexia: temp > 40.0 C
  if (temp !== null && temp > 40.0) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'SEPSIS_TEMP_GT_40',
      observed: temp,
      threshold: 'Temp > 40.0 C',
      clinicalFocus: 'Malignant hyperpyrexia, severe septic storm',
      message: `Tier-1 Red Flag [Domain 1 - Sepsis]: Severe hyperpyrexia (${temp}°C > 40.0°C). Severe sepsis / hyperthermic storm.`,
    });
  }

  return flags;
}
