/**
 * Domain 10: Allergic Reactions & Anaphylaxis
 * Rules:
 * - Angioedema of tongue/pharynx
 * - Acute stridor
 * - Wheezing WITH systemic hypotension
 */
import { VitalsInput, SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateAllergicDomain(
  vitals: Partial<VitalsInput>,
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 10;
  const domainName = 'Allergic Reactions';
  const clinicalFocus = 'Severe anaphylaxis, rapid fatal airway closure, distributive anaphylactic shock';

  const sbp = vitals.systolic_bp ?? null;
  const allergic = symptoms.allergic as Record<string, unknown> | undefined;
  const resp = symptoms.respiratory as Record<string, unknown> | undefined;

  // Angioedema of tongue / pharynx
  const hasMucosalSwelling = !!allergic?.mucosal_swelling;
  const hasVoiceChange = !!allergic?.voice_change;
  const hasStridor = !!resp?.stridor;

  if (hasMucosalSwelling && (hasVoiceChange || hasStridor)) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'ALLERGY_ANGIOEDEMA_AIRWAY',
      observed: { mucosal_swelling: true, voice_change: hasVoiceChange, stridor: hasStridor },
      threshold: 'Angioedema of tongue/pharynx WITH voice change or stridor',
      clinicalFocus: 'Severe anaphylaxis, rapid fatal airway closure',
      message: `Tier-1 Red Flag [Domain 10 - Allergic]: Angioedema of tongue/pharynx with acute airway compromise. Anaphylactic airway closure.`,
    });
  }

  // Acute Stridor in Allergic Context
  if (hasStridor && (hasMucosalSwelling || !!allergic?.urticaria)) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'ALLERGY_STRIDOR',
      observed: { stridor: true },
      threshold: 'Acute stridor in allergic reaction setting',
      clinicalFocus: 'Laryngeal edema, anaphylactic airway occlusion',
      message: `Tier-1 Red Flag [Domain 10 - Allergic]: Acute stridor presenting with allergic signs. Impending asphyxia.`,
    });
  }

  // Wheezing WITH Systemic Hypotension (Anaphylactic Shock)
  const hasWheeze = !!allergic?.wheeze;
  const isHypotensive = (sbp !== null && sbp < 90) || !!allergic?.systemic_hypotension;

  if (hasWheeze && isHypotensive) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'ALLERGY_WHEEZE_HYPOTENSION',
      observed: { wheeze: true, sbp },
      threshold: 'Wheezing WITH systemic hypotension (SBP < 90 mmHg)',
      clinicalFocus: 'Anaphylactic circulatory shock, bronchospasm collapse',
      message: `Tier-1 Red Flag [Domain 10 - Allergic]: Bronchospasm wheeze with systemic hypotension (SBP: ${sbp ?? 'N/A'} mmHg). Anaphylactic shock.`,
    });
  }

  return flags;
}
