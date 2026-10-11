/**
 * M3 AI/ML Prediction Service Boundary
 * Represents the typed contract between Module 4 (Safety Rules & Triage Flow) and Module 3 (ML Risk Model).
 * 
 * Safety Policy:
 * If ML model is unavailable and no red flag was triggered, returns an explicit
 * safe-failure state ('ML_SERVICE_UNAVAILABLE') with clinical warning.
 * It NEVER invents a low score or silently downgrades.
 */
import { AcuityCategory, ExplainabilityPayload } from '@/shared/types/triage';
import { ApiSuccessEnvelope, ApiErrorEnvelope } from '@/shared/contracts';
import { VitalsInput, SymptomVector, Demographics, MedicalHistory } from '@/modules/patient_intake/types';

export interface PredictionInput {
  patient_id: string;
  chief_complaint: string;
  vitals: Partial<VitalsInput>;
  symptom_vector: SymptomVector;
  demographics?: Partial<Demographics>;
  medical_history?: Partial<MedicalHistory>;
}

export interface PredictionResultData {
  calculated_risk_score: number;
  calculated_category: AcuityCategory;
  confidence_score: number;
  explainability_payload: ExplainabilityPayload;
  model_version: string;
}

export type PredictionResponse = ApiSuccessEnvelope<PredictionResultData> | ApiErrorEnvelope;

export interface PredictionService {
  predictRisk(input: PredictionInput): Promise<PredictionResponse>;
}

export class MockPredictionService implements PredictionService {
  private simulateFailure = false;

  public setSimulateFailure(fail: boolean): void {
    this.simulateFailure = fail;
  }

  async predictRisk(input: PredictionInput): Promise<PredictionResponse> {
    if (this.simulateFailure) {
      return {
        data: null,
        meta: { timestamp: new Date().toISOString() },
        error: {
          code: 'ML_SERVICE_UNAVAILABLE',
          message: 'The M3 risk prediction service is temporarily unavailable. Safe failure protocol active.',
          details: [],
        },
      };
    }

    // Default mock behavior calculating a baseline score based on symptoms & vitals
    const sbp = input.vitals.systolic_bp ?? 120;
    const hr = input.vitals.heart_rate ?? 75;

    let baselineScore = 20;
    if (sbp > 140 || sbp < 95) baselineScore += 25;
    if (hr > 100 || hr < 55) baselineScore += 25;

    const score = Math.min(84, Math.max(10, baselineScore));
    let category: AcuityCategory = 'LOW';
    if (score >= 60) category = 'HIGH';
    else if (score >= 30) category = 'MODERATE';

    return {
      data: {
        calculated_risk_score: score,
        calculated_category: category,
        confidence_score: 0.88,
        explainability_payload: {
          top_risk_drivers: [
            {
              feature: 'vitals_deviation',
              contribution_percent: 45,
              direction: 'positive',
              description: 'Physiological vital sign variance from baseline',
            },
          ],
          model_version: 'mock-m3-gradient-boost-v1.0',
          latency_ms: 12,
        },
        model_version: 'mock-m3-gradient-boost-v1.0',
      },
      meta: { timestamp: new Date().toISOString() },
      error: null,
    };
  }
}

export const predictionService: PredictionService = new MockPredictionService();
