/**
 * Domain 6: Diabetes-Related Risks
 * Rules:
 * - CBG < 60 mg/dL WITH altered consciousness
 * - OR CBG > 400 mg/dL WITH ketotic breathing
 */
import { VitalsInput, SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateDiabetesDomain(
  vitals: Partial<VitalsInput>,
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 6;
  const domainName = 'Diabetes-Related Risks';
  const clinicalFocus = 'Severe hypoglycemic coma, Diabetic Ketoacidosis (DKA), Hyperosmolar Hyperglycemic State (HHS)';

  const cbg = vitals.capillary_blood_glucose ?? null;
  const diabetes = symptoms.diabetes as Record<string, unknown> | undefined;
  const neuro = symptoms.neurological as Record<string, unknown> | undefined;
  const sepsis = symptoms.infection_sepsis as Record<string, unknown> | undefined;

  const alteredMentation =
    !!sepsis?.altered_mentation ||
    (typeof neuro?.gcs_score === 'number' && neuro.gcs_score < 15) ||
    !!diabetes?.altered_consciousness;

  const ketoticBreathing =
    !!diabetes?.kussmaul_breathing ||
    !!diabetes?.fruity_breath;

  // Severe Hypoglycemia with Altered Consciousness: CBG < 60
  if (cbg !== null && cbg < 60 && alteredMentation) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'DIAB_HYPO_ALTERED',
      observed: { cbg, alteredMentation },
      threshold: 'CBG < 60 mg/dL WITH altered consciousness',
      clinicalFocus: 'Severe hypoglycemic coma, acute neuroglycopenia',
      message: `Tier-1 Red Flag [Domain 6 - Diabetes]: Severe hypoglycemia (CBG ${cbg} mg/dL < 60 mg/dL with altered mentation). Impending coma.`,
    });
  }

  // Extreme Hyperglycemia with Ketotic/Kussmaul Breathing: CBG > 400
  if (cbg !== null && cbg > 400 && ketoticBreathing) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'DIAB_HYPER_KETOTIC',
      observed: { cbg, ketoticBreathing },
      threshold: 'CBG > 400 mg/dL WITH ketotic breathing',
      clinicalFocus: 'Diabetic Ketoacidosis (DKA), Hyperosmolar Hyperglycemic State (HHS)',
      message: `Tier-1 Red Flag [Domain 6 - Diabetes]: Extreme hyperglycemia (CBG ${cbg} mg/dL > 400 mg/dL with ketotic breathing). Severe DKA/HHS alert.`,
    });
  }

  return flags;
}
