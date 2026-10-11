/**
 * Domain 11: Dehydration & Fluid Balance
 * Rules:
 * - Anuria > 12 h
 * - Severe skin tenting
 * - Cold extremities WITH cap refill > 4 s
 */
import { SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateDehydrationDomain(
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 11;
  const domainName = 'Dehydration & Fluid Balance';
  const clinicalFocus = 'Profound hypovolemic shock, acute pre-renal azotemia, peripheral circulatory shutdown';

  const dehy = symptoms.dehydration as Record<string, unknown> | undefined;

  // Anuria > 12 hours
  if (dehy?.urine_output === 'none') {
    flags.push({
      domain,
      domainName,
      ruleCode: 'DEHYD_ANURIA_12H',
      observed: 'none',
      threshold: 'Anuria > 12 h (urine output none)',
      clinicalFocus: 'Severe hypovolemia, pre-renal acute renal failure',
      message: `Tier-1 Red Flag [Domain 11 - Dehydration]: Anuria > 12 hours. Severe hypovolemia, pre-renal acute renal failure alert.`,
    });
  }

  // Severe Skin Tenting
  if (dehy?.skin_turgor === 'tented') {
    flags.push({
      domain,
      domainName,
      ruleCode: 'DEHYD_TENTING_SEVERE',
      observed: 'tented',
      threshold: 'Severe skin tenting present',
      clinicalFocus: 'Extreme fluid loss (> 10% body weight deficit), hypovolemic crisis',
      message: `Tier-1 Red Flag [Domain 11 - Dehydration]: Severe skin tenting observed. Profound intracellular and intravascular dehydration.`,
    });
  }

  // Cold Extremities WITH Capillary Refill > 4 seconds
  const capRefill = typeof dehy?.capillary_refill_seconds === 'number' ? dehy.capillary_refill_seconds : null;
  const hasColdExtremities = !!dehy?.cold_extremities || dehy?.skin_turgor === 'reduced';

  if (capRefill !== null && capRefill > 4 && hasColdExtremities) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'DEHYD_COLD_EXTREMITIES_CAP_REFILL',
      observed: { capRefill, coldExtremities: true },
      threshold: 'Cold extremities WITH capillary refill > 4 s',
      clinicalFocus: 'Severe peripheral vasoconstriction, decompensated shock',
      message: `Tier-1 Red Flag [Domain 11 - Dehydration]: Cold extremities with severe capillary refill delay (${capRefill}s > 4s). Peripheral hypoperfusion.`,
    });
  }

  return flags;
}
