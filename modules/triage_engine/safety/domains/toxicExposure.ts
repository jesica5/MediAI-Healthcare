/**
 * Domain 12: Multi-System & Toxic Exposure
 * Rules:
 * - Organophosphate (SLUDGE) signs
 * - Venomous bite with ptosis
 */
import { SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateToxicExposureDomain(
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 12;
  const domainName = 'Multi-System / Toxic Exposure';
  const clinicalFocus = 'Acute cholinergic crisis / organophosphate toxicity, neurotoxic envenomation';

  const toxic = symptoms.toxic_exposure as Record<string, unknown> | undefined;
  const neuro = symptoms.neurological as Record<string, unknown> | undefined;
  const resp = symptoms.respiratory as Record<string, unknown> | undefined;

  // Organophosphate / Cholinergic SLUDGE Crisis
  const isExcessiveSalivation = toxic?.salivation === 'excessive';
  const isPinpointPupils = toxic?.pupil_size === 'pinpoint';
  const hasSludge = (isExcessiveSalivation && isPinpointPupils) || !!toxic?.sludge_syndrome;

  if (hasSludge) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'TOXIC_SLUDGE',
      observed: { salivation: toxic?.salivation, pupil_size: toxic?.pupil_size },
      threshold: 'Organophosphate SLUDGE signs (excessive salivation + pinpoint pupils)',
      clinicalFocus: 'Acute organophosphate poisoning, cholinergic toxidrome crisis',
      message: `Tier-1 Red Flag [Domain 12 - Toxic Exposure]: Classic SLUDGE toxidrome signs (excessive salivation, pinpoint pupils). Organophosphate emergency.`,
    });
  }

  // Venomous Bite with Ptosis / Neurotoxicity
  const hasBite = !!toxic?.puncture_marks;
  const hasNeuroParalysis = !!toxic?.ptosis || !!neuro?.fast_facial_droop || !!resp?.accessory_muscle_use;

  if (hasBite && hasNeuroParalysis) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'TOXIC_BITE_PTOSIS',
      observed: { puncture_marks: true, neuroParalysis: true },
      threshold: 'Venomous bite / puncture marks WITH ptosis or neuromuscular weakness',
      clinicalFocus: 'Neurotoxic envenomation, impending diaphragmatic respiratory paralysis',
      message: `Tier-1 Red Flag [Domain 12 - Toxic Exposure]: Puncture bite with descending ptosis / neurotoxicity. Neurotoxic envenomation alert.`,
    });
  }

  return flags;
}
