/**
 * Domain 4: Neurological Warning Signs
 * Rules:
 * - Acute focal deficit (FAST: facial droop, arm drift, slurred speech)
 * - OR GCS < 12
 * - OR status epilepticus / active seizures
 */
import { SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateNeurologicalDomain(
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 4;
  const domainName = 'Neurological Warning Signs';
  const clinicalFocus = 'Acute ischemic stroke, intracranial hemorrhage, status epilepticus';

  const neuro = symptoms.neurological as Record<string, unknown> | undefined;

  const facialDroop = !!neuro?.fast_facial_droop;
  const armDrift = !!neuro?.fast_arm_drift;
  const speechDifficulty = !!neuro?.fast_speech_difficulty;
  const hasFastDeficit = facialDroop || armDrift || speechDifficulty;

  if (hasFastDeficit) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'NEURO_FAST_DEFICIT',
      observed: { facialDroop, armDrift, speechDifficulty },
      threshold: 'Acute focal neurological deficit (FAST criteria positive)',
      clinicalFocus: 'Acute ischemic stroke, intracranial hemorrhage',
      message: `Tier-1 Red Flag [Domain 4 - Neurological]: Acute focal neurological deficit (FAST criteria positive). Acute stroke alert.`,
    });
  }

  const gcs = typeof neuro?.gcs_score === 'number' ? neuro.gcs_score : null;
  if (gcs !== null && gcs < 12) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'NEURO_GCS_LT_12',
      observed: gcs,
      threshold: 'GCS < 12',
      clinicalFocus: 'Severe central nervous system depression',
      message: `Tier-1 Red Flag [Domain 4 - Neurological]: Depressed consciousness (GCS score ${gcs} < 12).`,
    });
  }

  const seizures = !!neuro?.seizures;
  if (seizures) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'NEURO_STATUS_EPILEPTICUS',
      observed: true,
      threshold: 'Active or recurrent seizures / status epilepticus',
      clinicalFocus: 'Status epilepticus, acute central neurological seizure',
      message: `Tier-1 Red Flag [Domain 4 - Neurological]: Active or recurrent seizures / suspected status epilepticus.`,
    });
  }

  return flags;
}
