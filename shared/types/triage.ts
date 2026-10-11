export type AcuityCategory = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export type TriageStatus = 'PENDING_REVIEW' | 'CONFIRMED' | 'OVERRIDDEN' | 'DISCHARGED';

export interface Patient {
  id: string;
  mrn_hash: string;
  display_name: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  primary_language: 'en' | 'ta';
  medical_history?: string[];
  allergies?: string[];
  created_at: string;
  updated_at: string;
}

export interface VitalSigns {
  id: string;
  patient_id: string;
  heart_rate: number | null; // 20 - 300 bpm
  respiratory_rate: number | null; // 4 - 80 bpm
  systolic_bp: number | null; // 40 - 300 mmHg
  diastolic_bp: number | null; // 20 - 200 mmHg
  oxygen_saturation: number | null; // 40.0 - 100.0 %
  temperature_celsius: number | null; // 30.0 - 45.0 °C
  capillary_blood_glucose: number | null; // mg/dL
  recorded_by: string;
  recorded_at: string;
}

export interface ShapFeatureAttribution {
  feature: string;
  contribution_percent: number;
  direction: 'positive' | 'negative';
  description: string;
}

export interface ExplainabilityPayload {
  top_risk_drivers: ShapFeatureAttribution[];
  model_version: string;
  latency_ms: number;
  missing_vitals_warning?: boolean;
  missing_vitals_list?: string[];
}

export interface TriageAssessment {
  id: string;
  patient_id: string;
  vital_id: string;
  chief_complaint: string;
  symptom_vector: Record<string, boolean | string | number>;
  calculated_risk_score: number; // 0 - 100
  calculated_category: AcuityCategory;
  hard_red_flag_triggered: boolean;
  red_flag_details: string[];
  confidence_score: number; // 0.00 - 1.00
  explainability_payload: ExplainabilityPayload;
  status: TriageStatus;
  created_at: string;

  // Joined entity details for UI rendering
  patient?: Patient;
  vitals?: VitalSigns;
  vitals_history?: VitalSigns[];
}

export interface TriageReview {
  id: string;
  assessment_id: string;
  doctor_id: string;
  doctor_name?: string;
  original_category: AcuityCategory;
  final_category: AcuityCategory;
  is_overridden: boolean;
  override_reason?: string;
  clinical_notes?: string;
  reviewed_at: string;
}

export interface MedicationRecord {
  id: string;
  patient_id: string;
  medication_name: string;
  reported_dosage: string;
  frequency: string;
  route?: string;
  status: 'ACTIVE' | 'RECONCILED' | 'DISCONTINUED';
  reconciliation_notes?: string;
  reconciled_by?: string;
  updated_at: string;
}
