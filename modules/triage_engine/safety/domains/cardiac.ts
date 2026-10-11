/**
 * Domain 3: Cardiac Warning Signs
 * Rules:
 * - Crushing retrosternal pain radiating to jaw/left arm
 * - OR syncope with chest pressure
 * - OR HR > 150 or < 40 bpm
 */
import { VitalsInput, SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateCardiacDomain(
  vitals: Partial<VitalsInput>,
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 3;
  const domainName = 'Cardiac Warning Signs';
  const clinicalFocus = 'Acute Coronary Syndrome (ACS), malignant ventricular arrhythmia, cardiogenic collapse';

  const hr = vitals.heart_rate ?? null;
  const cardiac = symptoms.cardiac as Record<string, unknown> | undefined;

  const painChar = cardiac?.chest_pain_character;
  const isCrushing =
    painChar === 'pressure' || painChar === 'tearing' || painChar === 'sharp';
  const radiation = cardiac?.radiation;
  const hasAcsRadiation =
    radiation === 'left_arm' || radiation === 'jaw' || radiation === 'both_arms';

  // Crushing Retrosternal Pain with Radiation
  if (isCrushing && hasAcsRadiation) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'CARD_ACS_RADIATING',
      observed: { chest_pain_character: painChar, radiation },
      threshold: 'Crushing chest pain radiating to jaw or left arm',
      clinicalFocus: 'Acute myocardial infarction, Acute Coronary Syndrome (ACS)',
      message: `Tier-1 Red Flag [Domain 3 - Cardiac]: Crushing retrosternal chest pain radiating to ${String(radiation)}. Suspected Acute Coronary Syndrome (ACS).`,
    });
  }

  // Syncope with Chest Pressure
  const hasSyncope = !!cardiac?.syncope;
  const hasChestPressure = painChar === 'pressure' || painChar === 'crushing';
  if (hasSyncope && hasChestPressure) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'CARD_SYNCOPE_CHEST_PRESSURE',
      observed: { syncope: true, chest_pain_character: painChar },
      threshold: 'Syncope WITH chest pressure',
      clinicalFocus: 'Cardiogenic syncope, aortic dissection, acute hemodynamic infarction',
      message: `Tier-1 Red Flag [Domain 3 - Cardiac]: Syncope with retrosternal chest pressure. High cardiogenic shock risk.`,
    });
  }

  // Heart Rate Extreme: HR > 150 or < 40 bpm
  if (hr !== null) {
    if (hr > 150) {
      flags.push({
        domain,
        domainName,
        ruleCode: 'CARD_HR_EXTREME_HIGH',
        observed: hr,
        threshold: 'HR > 150 bpm',
        clinicalFocus: 'Severe tachyarrhythmia, ventricular tachycardia / rapid AF',
        message: `Tier-1 Red Flag [Domain 3 - Cardiac]: Extreme tachycardia (${hr} bpm > 150 bpm). Malignant arrhythmia risk.`,
      });
    } else if (hr < 40) {
      flags.push({
        domain,
        domainName,
        ruleCode: 'CARD_HR_EXTREME_LOW',
        observed: hr,
        threshold: 'HR < 40 bpm',
        clinicalFocus: 'Severe bradyarrhythmia, complete heart block / sinus arrest',
        message: `Tier-1 Red Flag [Domain 3 - Cardiac]: Extreme bradycardia (${hr} bpm < 40 bpm). Complete heart block risk.`,
      });
    }
  }

  return flags;
}
