/**
 * Demographic & Comorbidity Risk Modifier Engine
 * Computes S_demographics in [0, 100] (Specification Section 7).
 */
import { Demographics, MedicalHistory } from '@/modules/patient_intake/types';
import { DemographicScoreResult } from '../types';

export function calculateDemographicRiskScore(
  demographics?: Partial<Demographics>,
  medicalHistory?: Partial<MedicalHistory>
): DemographicScoreResult {
  let score = 0;
  const riskFactors: string[] = [];

  // Age calculation from date_of_birth or age
  let age: number | null = null;
  if (demographics?.age !== undefined) {
    age = demographics.age;
  } else if (demographics?.date_of_birth) {
    const dob = new Date(demographics.date_of_birth);
    if (!isNaN(dob.getTime())) {
      const diffMs = Date.now() - dob.getTime();
      age = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
    }
  }

  // 1. Age Risk Modifiers
  if (age !== null) {
    if (age >= 80) {
      score += 40;
      riskFactors.push(`Advanced Age: ${age} years (>= 80)`);
    } else if (age >= 65) {
      score += 30;
      riskFactors.push(`Elderly Age: ${age} years (>= 65)`);
    } else if (age <= 2) {
      score += 30;
      riskFactors.push(`Neonate / Infant Vulnerability: ${age} years`);
    }
  }

  // 2. Immunosuppression
  if (medicalHistory?.immunosuppression) {
    score += 40;
    riskFactors.push('Known immunosuppressed state (high sepsis / vulnerability risk)');
  }

  // 3. Severe Chronic Comorbidities
  if (medicalHistory?.severe_chronic_comorbidity) {
    score += 30;
    const note = medicalHistory.comorbidity_note ? `: ${medicalHistory.comorbidity_note}` : '';
    riskFactors.push(`Severe chronic comorbidity${note}`);
  }

  // 4. Pregnancy Modifier
  if (medicalHistory?.pregnancy_status === 'pregnant') {
    score += 20;
    riskFactors.push('Active pregnancy physiological modifier');
  }

  const normalizedScore = Math.min(100, Math.max(0, score));

  return {
    score: normalizedScore,
    riskFactors,
  };
}
