/**
 * Triage Engine Types & Domain Interfaces
 */
import { AcuityCategory, VitalSigns, ExplainabilityPayload } from '@/shared/types/triage';
import { VitalsInput, SymptomVector, Demographics, MedicalHistory } from '@/modules/patient_intake/types';

export interface RedFlagEvaluationResult {
  hasRedFlag: boolean;
  domainNumber: number | null;
  domainName: string | null;
  clinicalFocus: string | null;
  reason: string | null;
  triggeredFlags: string[];
  triggeredDomains: number[];
}

export interface VitalScoreResult {
  score: number; // 0 - 100
  abnormalities: string[];
  severelyAbnormalCount: number;
  moderatelyAbnormalCount: number;
}

export interface DemographicScoreResult {
  score: number; // 0 - 100
  riskFactors: string[];
}

export interface SymptomScoreResult {
  score: number; // 0 - 100
  contributingSymptoms: string[];
}

export interface DeltaScoreResult {
  score: number; // 0 - 20
  trend: 'stable' | 'deteriorating' | 'improving' | 'none';
  rateOfChange: number;
}

export interface TriageEngineInput {
  patient_id: string;
  demographics?: Partial<Demographics>;
  vitals: Partial<VitalsInput>;
  symptom_vector: SymptomVector;
  medical_history?: Partial<MedicalHistory>;
  chief_complaint: string;
  vitals_history?: VitalSigns[];
  language?: 'en' | 'ta';
}

export interface TriageEngineOutput {
  calculated_risk_score: number; // 0 - 100
  calculated_category: AcuityCategory;
  hard_red_flag_triggered: boolean;
  red_flag_details: string[];
  confidence_score: number; // 0.0 - 1.0
  confidence_level: 'HIGH' | 'LOW';
  missing_essential_vitals: string[];
  score_breakdown: {
    s_vitals: number;
    w_v: number;
    s_symptoms: number;
    w_s: number;
    s_demographics: number;
    w_d: number;
    s_delta: number;
    formula: string;
  };
  explainability_payload: ExplainabilityPayload;
}
