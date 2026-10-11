/**
 * Master Clinical Triage Engine Service
 * Implements Master Application Flow (Specification Section 4) & Mathematical Formulation (Section 7).
 *
 * Scoring Formula:
 * Score = W_V * S_vitals + W_S * S_symptoms + W_D * S_demographics + S_delta
 * Weights: W_V = 0.50, W_S = 0.35, W_D = 0.15
 */
import { AcuityCategory } from '@/shared/types/triage';
import { TriageEngineInput, TriageEngineOutput } from '../types';
import { evaluateClinicalRedFlags } from '../safety/redFlagRules';
import { calculateVitalDeviationScore } from '../scoring/vitalScoring';
import { calculateSymptomEnsembleScore } from '../scoring/symptomScoring';
import { calculateDemographicRiskScore } from '../scoring/demographicScoring';
import { calculatePhysiologicalDeltaScore } from '../scoring/deltaScoring';
import { generateTreeShapAttribution } from '../explainability/treeShapAdapter';

export class TriageEngine {
  private static readonly W_V = 0.50;
  private static readonly W_S = 0.35;
  private static readonly W_D = 0.15;

  /**
   * Evaluates essential vitals: SpO2, SBP, HR
   */
  public static checkMissingEssentialVitals(vitals: TriageEngineInput['vitals']): string[] {
    const missing: string[] = [];
    if (vitals.oxygen_saturation === null || vitals.oxygen_saturation === undefined) {
      missing.push('oxygen_saturation');
    }
    if (vitals.systolic_bp === null || vitals.systolic_bp === undefined) {
      missing.push('systolic_bp');
    }
    if (vitals.heart_rate === null || vitals.heart_rate === undefined) {
      missing.push('heart_rate');
    }
    return missing;
  }

  /**
   * Maps numerical score (0 - 100) to 4-tier clinical acuity category (Section 7)
   */
  public static mapScoreToAcuityCategory(score: number): AcuityCategory {
    if (score >= 85) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Main assessment execution method
   */
  public static assess(input: TriageEngineInput): TriageEngineOutput {
    const { vitals, symptom_vector, medical_history, demographics, chief_complaint, vitals_history } = input;

    // 1. Missing Essential Vitals Protocol (Section 8)
    const missingEssentials = this.checkMissingEssentialVitals(vitals);
    const hasMissingEssentials = missingEssentials.length > 0;

    // 2. Safety Pre-Check Engine: Evaluate Tier-1 Hard Red Flags (Section 5)
    const redFlagResult = evaluateClinicalRedFlags(vitals, symptom_vector, medical_history);

    // 3. Mathematical Scoring Calculations (Section 7)
    const vitalsResult = calculateVitalDeviationScore(vitals);
    const symptomsResult = calculateSymptomEnsembleScore(symptom_vector, chief_complaint);
    const demographicsResult = calculateDemographicRiskScore(demographics, medical_history);
    const deltaResult = calculatePhysiologicalDeltaScore(vitals, vitals_history);

    // Mathematical formula: Score = W_V * S_vitals + W_S * S_symptoms + W_D * S_demographics + S_delta
    const rawScore =
      this.W_V * vitalsResult.score +
      this.W_S * symptomsResult.score +
      this.W_D * demographicsResult.score +
      deltaResult.score;

    let finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));
    let acuityCategory = this.mapScoreToAcuityCategory(finalScore);

    // 4. HARD RED FLAG OVERRIDE:
    // If a Tier-1 red flag was detected, instantly escalate to CRITICAL (P1, score >= 85).
    // ML and heuristic scores CAN NEVER downgrade a critical red flag.
    if (redFlagResult.hasRedFlag) {
      acuityCategory = 'CRITICAL';
      finalScore = Math.max(88, finalScore); // Hard override to Critical score band (85-100)
    }

    // 5. Confidence Score Calculation
    // If essential vitals are unrecorded, confidence is flagged as "LOW"
    const confidenceScore = hasMissingEssentials
      ? 0.60
      : (vitalsResult.severelyAbnormalCount > 0 || redFlagResult.hasRedFlag ? 0.98 : 0.92);
    const confidenceLevel: 'HIGH' | 'LOW' = hasMissingEssentials ? 'LOW' : 'HIGH';

    // 6. Explainable AI Feature Attribution (TreeSHAP < 100ms)
    const explainabilityPayload = generateTreeShapAttribution({
      vitalsResult,
      symptomsResult,
      demographicsResult,
      deltaResult,
      missingEssentialVitals: missingEssentials,
      hardRedFlagTriggered: redFlagResult.hasRedFlag,
      redFlagReason: redFlagResult.reason,
    });

    return {
      calculated_risk_score: finalScore,
      calculated_category: acuityCategory,
      hard_red_flag_triggered: redFlagResult.hasRedFlag,
      red_flag_details: redFlagResult.triggeredFlags,
      confidence_score: confidenceScore,
      confidence_level: confidenceLevel,
      missing_essential_vitals: missingEssentials,
      score_breakdown: {
        s_vitals: vitalsResult.score,
        w_v: this.W_V,
        s_symptoms: symptomsResult.score,
        w_s: this.W_S,
        s_demographics: demographicsResult.score,
        w_d: this.W_D,
        s_delta: deltaResult.score,
        formula: 'Score = 0.50 * S_vitals + 0.35 * S_symptoms + 0.15 * S_demographics + S_delta',
      },
      explainability_payload: explainabilityPayload,
    };
  }
}
