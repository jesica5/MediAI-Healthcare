/**
 * Domain 7: Gastrointestinal Issues
 * Rules:
 * - Massive hematemesis
 * - OR involuntary guarding / peritonism rigidity
 * - OR melena with hemodynamic instability
 */
import { VitalsInput, SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateGastrointestinalDomain(
  vitals: Partial<VitalsInput>,
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 7;
  const domainName = 'Gastrointestinal Issues';
  const clinicalFocus = 'Exsanguinating GI hemorrhage, acute surgical abdomen, peritonitis';

  const sbp = vitals.systolic_bp ?? null;
  const hr = vitals.heart_rate ?? null;
  const gi = symptoms.gastrointestinal as Record<string, unknown> | undefined;

  // Massive Hematemesis
  if (gi?.emesis === 'hematemesis') {
    flags.push({
      domain,
      domainName,
      ruleCode: 'GI_HEMATEMESIS',
      observed: 'hematemesis',
      threshold: 'Massive hematemesis present',
      clinicalFocus: 'Active variceal or peptic upper GI hemorrhage',
      message: `Tier-1 Red Flag [Domain 7 - Gastrointestinal]: Massive hematemesis (vomiting blood). Active severe upper GI hemorrhage.`,
    });
  }

  // Involuntary Guarding / Peritoneal Rigidity
  const hasGuardRigidity = !!gi?.rebound_tenderness || !!gi?.involuntary_guarding;
  if (hasGuardRigidity) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'GI_PERITONISM',
      observed: { rebound_tenderness: !!gi?.rebound_tenderness, involuntary_guarding: !!gi?.involuntary_guarding },
      threshold: 'Involuntary guarding / acute peritoneal rigidity',
      clinicalFocus: 'Perforated hollow viscus, acute peritonitis, acute surgical abdomen',
      message: `Tier-1 Red Flag [Domain 7 - Gastrointestinal]: Involuntary guarding / rebound rigidity. Acute peritonitis / surgical abdomen alert.`,
    });
  }

  // Melena with Hemodynamic Instability
  const isMelena = gi?.stool_color === 'melena';
  const hasInstability =
    (sbp !== null && sbp < 90) ||
    (hr !== null && hr > 110) ||
    !!gi?.hemodynamic_instability;

  if (isMelena && hasInstability) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'GI_MELENA_INSTABILITY',
      observed: { stool_color: 'melena', sbp, hr },
      threshold: 'Melena WITH hemodynamic instability (SBP < 90 or HR > 110)',
      clinicalFocus: 'Exsanguinating gastrointestinal hemorrhage with shock',
      message: `Tier-1 Red Flag [Domain 7 - Gastrointestinal]: Melena with hemodynamic compromise (SBP: ${sbp ?? 'N/A'}, HR: ${hr ?? 'N/A'}). Exsanguinating bleed.`,
    });
  }

  return flags;
}
