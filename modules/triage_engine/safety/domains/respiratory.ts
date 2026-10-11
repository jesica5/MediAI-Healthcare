/**
 * Domain 2: Respiratory Warning Signs
 * Rules:
 * - SpO2 < 90% on room air
 * - OR cyanosis
 * - OR audible stridor
 * - OR RR > 32 or < 8 bpm
 */
import { VitalsInput, SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateRespiratoryDomain(
  vitals: Partial<VitalsInput>,
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 2;
  const domainName = 'Respiratory Warning Signs';
  const clinicalFocus = 'Acute respiratory distress, severe airway obstruction, impending respiratory arrest';

  const spo2 = vitals.oxygen_saturation ?? null;
  const rr = vitals.respiratory_rate ?? null;
  const respSymptoms = symptoms.respiratory as Record<string, unknown> | undefined;
  const hasCyanosis = !!respSymptoms?.cyanosis;
  const hasStridor = !!respSymptoms?.stridor;

  // Severe Hypoxemia: SpO2 < 90.0%
  if (spo2 !== null && spo2 < 90.0) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'RESP_SPO2_LT_90',
      observed: spo2,
      threshold: 'SpO2 < 90%',
      clinicalFocus: 'Severe hypoxemia, acute respiratory distress, impending respiratory failure',
      message: `Tier-1 Red Flag [Domain 2 - Respiratory]: Severe hypoxemia (SpO2 ${spo2}% < 90% on room air).`,
    });
  }

  // Cyanosis
  if (hasCyanosis) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'RESP_CYANOSIS',
      observed: true,
      threshold: 'Central/peripheral cyanosis present',
      clinicalFocus: 'Critical tissue deoxygenation',
      message: `Tier-1 Red Flag [Domain 2 - Respiratory]: Clinical cyanosis observed. Immediate oxygenation emergency.`,
    });
  }

  // Audible Stridor
  if (hasStridor) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'RESP_STRIDOR',
      observed: true,
      threshold: 'Audible stridor present',
      clinicalFocus: 'Acute upper airway obstruction, laryngeal edema',
      message: `Tier-1 Red Flag [Domain 2 - Respiratory]: Audible upper airway stridor. Critical acute upper airway compromise.`,
    });
  }

  // Respiratory Rate Extreme: RR > 32 or < 8 bpm
  if (rr !== null) {
    if (rr > 32) {
      flags.push({
        domain,
        domainName,
        ruleCode: 'RESP_RR_EXTREME_HIGH',
        observed: rr,
        threshold: 'RR > 32 bpm',
        clinicalFocus: 'Severe tachypnea, impending respiratory exhaustion',
        message: `Tier-1 Red Flag [Domain 2 - Respiratory]: Extreme tachypnea (${rr} bpm > 32 bpm).`,
      });
    } else if (rr < 8) {
      flags.push({
        domain,
        domainName,
        ruleCode: 'RESP_RR_EXTREME_LOW',
        observed: rr,
        threshold: 'RR < 8 bpm',
        clinicalFocus: 'Severe bradypnea, impending respiratory arrest',
        message: `Tier-1 Red Flag [Domain 2 - Respiratory]: Extreme bradypnea (${rr} bpm < 8 bpm).`,
      });
    }
  }

  return flags;
}
