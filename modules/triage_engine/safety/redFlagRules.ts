/**
 * Master Deterministic Clinical Red-Flag Safety Engine
 * Evaluates the 12 clinical physiological risk categories defined in the MediAI Master Specification (Section 5).
 *
 * Safety Boundary:
 * A positive match on ANY Tier-1 Red Flag immediately forces a hardcoded triage acuity
 * of Critical (Priority 1, score = 100) and bypasses probabilistic machine-learning models.
 *
 * Pure function: No DB, No I/O, No network, No ML import, No Gemini.
 */
import { VitalsInput, SymptomVector, MedicalHistory } from '@/modules/patient_intake/types';
import { RedFlagEvaluationResult, RedFlagItem } from '../types';

import { evaluateSepsisDomain } from './domains/sepsis';
import { evaluateRespiratoryDomain } from './domains/respiratory';
import { evaluateCardiacDomain } from './domains/cardiac';
import { evaluateNeurologicalDomain } from './domains/neurological';
import { evaluateBloodPressureDomain } from './domains/bloodPressure';
import { evaluateDiabetesDomain } from './domains/diabetes';
import { evaluateGastrointestinalDomain } from './domains/gastrointestinal';
import { evaluateTraumaDomain } from './domains/trauma';
import { evaluatePregnancyDomain } from './domains/pregnancy';
import { evaluateAllergicDomain } from './domains/allergic';
import { evaluateDehydrationDomain } from './domains/dehydration';
import { evaluateToxicExposureDomain } from './domains/toxicExposure';
import { evaluateVitalBaselines } from './domains/vitalBaselines';

export function evaluateClinicalRedFlags(
  vitals: Partial<VitalsInput> = {},
  symptoms: SymptomVector = {},
  history?: Partial<MedicalHistory>
): RedFlagEvaluationResult {
  const flags: RedFlagItem[] = [];

  // 1. Evaluate all 12 clinical domains independently
  flags.push(...evaluateSepsisDomain(vitals, symptoms));
  flags.push(...evaluateRespiratoryDomain(vitals, symptoms));
  flags.push(...evaluateCardiacDomain(vitals, symptoms));
  flags.push(...evaluateNeurologicalDomain(symptoms));
  flags.push(...evaluateBloodPressureDomain(vitals, symptoms));
  flags.push(...evaluateDiabetesDomain(vitals, symptoms));
  flags.push(...evaluateGastrointestinalDomain(vitals, symptoms));
  flags.push(...evaluateTraumaDomain(symptoms));
  flags.push(...evaluatePregnancyDomain(vitals, symptoms, history));
  flags.push(...evaluateAllergicDomain(vitals, symptoms));
  flags.push(...evaluateDehydrationDomain(symptoms));
  flags.push(...evaluateToxicExposureDomain(symptoms));

  // 2. Evaluate cross-category standalone vital baselines
  flags.push(...evaluateVitalBaselines(vitals));

  // Deduplicate and aggregate
  const triggeredFlags = flags.map((f) => f.message);
  const triggeredDomains: number[] = Array.from(new Set(flags.map((f) => f.domain))).sort((a, b) => a - b);
  const firstFlag = flags[0] ?? null;

  return {
    hasRedFlag: flags.length > 0,
    hardRedFlagTriggered: flags.length > 0,
    flags,
    domainNumber: firstFlag?.domain ?? null,
    domainName: firstFlag?.domainName ?? null,
    clinicalFocus: firstFlag?.clinicalFocus ?? null,
    reason: firstFlag?.message ?? null,
    triggeredFlags,
    triggeredDomains,
  };
}

export {
  evaluateSepsisDomain,
  evaluateRespiratoryDomain,
  evaluateCardiacDomain,
  evaluateNeurologicalDomain,
  evaluateBloodPressureDomain,
  evaluateDiabetesDomain,
  evaluateGastrointestinalDomain,
  evaluateTraumaDomain,
  evaluatePregnancyDomain,
  evaluateAllergicDomain,
  evaluateDehydrationDomain,
  evaluateToxicExposureDomain,
  evaluateVitalBaselines,
};
