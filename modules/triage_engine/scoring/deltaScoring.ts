/**
 * Physiological Trajectory Delta Scoring Engine
 * Computes S_delta in [0, 20] measuring deterioration rate between consecutive vital sign captures (Specification Section 7).
 */
import { VitalsInput } from '@/modules/patient_intake/types';
import { VitalSigns } from '@/shared/types/triage';
import { DeltaScoreResult } from '../types';

export function calculatePhysiologicalDeltaScore(
  currentVitals: Partial<VitalsInput>,
  vitalsHistory?: VitalSigns[]
): DeltaScoreResult {
  if (!vitalsHistory || vitalsHistory.length === 0) {
    return {
      score: 0,
      trend: 'none',
      rateOfChange: 0,
    };
  }

  // Get previous recording (most recent in history)
  const previous = vitalsHistory[0];
  let deltaScore = 0;
  let hasDeterioration = false;
  let hasImprovement = false;

  const currentSpo2 = currentVitals.oxygen_saturation ?? null;
  const prevSpo2 = previous.oxygen_saturation ?? null;
  if (currentSpo2 !== null && prevSpo2 !== null) {
    const spo2Drop = prevSpo2 - currentSpo2;
    if (spo2Drop >= 4) {
      deltaScore += 10;
      hasDeterioration = true;
    } else if (spo2Drop >= 2) {
      deltaScore += 5;
      hasDeterioration = true;
    } else if (currentSpo2 > prevSpo2) {
      hasImprovement = true;
    }
  }

  const currentHr = currentVitals.heart_rate ?? null;
  const prevHr = previous.heart_rate ?? null;
  if (currentHr !== null && prevHr !== null) {
    const hrRise = currentHr - prevHr;
    if (hrRise >= 25) {
      deltaScore += 6;
      hasDeterioration = true;
    } else if (hrRise >= 15) {
      deltaScore += 3;
      hasDeterioration = true;
    }
  }

  const currentSbp = currentVitals.systolic_bp ?? null;
  const prevSbp = previous.systolic_bp ?? null;
  if (currentSbp !== null && prevSbp !== null) {
    const sbpDrop = prevSbp - currentSbp;
    if (sbpDrop >= 25 && currentSbp < 100) {
      deltaScore += 8;
      hasDeterioration = true;
    } else if (sbpDrop >= 15) {
      deltaScore += 4;
      hasDeterioration = true;
    }
  }

  const currentRr = currentVitals.respiratory_rate ?? null;
  const prevRr = previous.respiratory_rate ?? null;
  if (currentRr !== null && prevRr !== null) {
    const rrRise = currentRr - prevRr;
    if (rrRise >= 8) {
      deltaScore += 6;
      hasDeterioration = true;
    }
  }

  const score = Math.min(20, Math.max(0, deltaScore));
  const trend = hasDeterioration ? 'deteriorating' : (hasImprovement ? 'improving' : 'stable');

  return {
    score,
    trend,
    rateOfChange: score,
  };
}
