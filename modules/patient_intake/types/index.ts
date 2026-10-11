/**
 * Module M2: Health Assessment & Medical History Types
 */

import type { Language, Gender as SharedGender } from '@/shared/types';
export type { Language };

export type IntakeGender = 'female' | 'male' | 'other' | 'prefer_not_to_say';
export type Gender = IntakeGender;

export type IntakeUserRole = 'anonymous_patient' | 'nurse' | 'doctor' | 'admin';
export type UserRole = IntakeUserRole;

export function toSharedGender(gender: IntakeGender): SharedGender {
  switch (gender) {
    case 'male':
      return 'MALE';
    case 'female':
      return 'FEMALE';
    case 'other':
      return 'OTHER';
    case 'prefer_not_to_say':
      return 'PREFER_NOT_TO_SAY';
  }
}

export interface Demographics {
  chief_complaint: string;
  date_of_birth?: string | null;
  age?: number | null;
  gender: IntakeGender;
  primary_language: Language;
}

export interface InfectionSepsisSymptoms {
  altered_mentation?: boolean;
  rigors?: boolean;
  diaphoresis?: boolean;
}

export interface RespiratorySymptoms {
  cough_character?: 'none' | 'dry' | 'productive' | 'hemoptysis';
  accessory_muscle_use?: boolean;
  stridor?: boolean;
}

export interface CardiacSymptoms {
  chest_pain_character?: 'none' | 'pressure' | 'sharp' | 'tearing' | 'burning' | 'other';
  radiation?: 'none' | 'left_arm' | 'jaw' | 'back' | 'both_arms' | 'other';
  diaphoresis?: boolean;
  palpitations?: boolean;
}

export interface NeurologicalSymptoms {
  fast_facial_droop?: boolean;
  fast_arm_drift?: boolean;
  fast_speech_difficulty?: boolean;
  gcs_score?: number | null;
  pupil_response?: 'normal' | 'sluggish' | 'unresponsive' | 'asymmetric';
  seizures?: boolean;
}

export interface BloodPressureSymptoms {
  severe_headache?: boolean;
  chest_pain?: boolean;
}

export interface DiabetesSymptoms {
  kussmaul_breathing?: boolean;
  fruity_breath?: boolean;
}

export interface GastrointestinalSymptoms {
  pain_quadrant?: 'none' | 'RUQ' | 'LUQ' | 'RLQ' | 'LLQ' | 'epigastric' | 'periumbilical' | 'diffuse';
  rebound_tenderness?: boolean;
  emesis?: 'none' | 'clear' | 'bilious' | 'coffee_ground' | 'hematemesis';
  stool_color?: 'normal' | 'melena' | 'hematochezia' | 'clay_colored';
}

export interface InjuryTraumaSymptoms {
  mechanism?: 'none' | 'blunt' | 'penetrating' | 'fall' | 'mva' | 'burn' | 'other';
  bleeding_rate?: 'none' | 'controlled' | 'rapid' | 'pulsatile';
  deformity?: boolean;
  airway_patency?: 'patent' | 'threatened' | 'obstructed';
}

export interface PregnancySymptoms {
  gestational_age_weeks?: number | null;
  pelvic_pain?: boolean;
  vaginal_bleeding?: boolean;
  severe_headache?: boolean;
}

export interface AllergicSymptoms {
  urticaria?: boolean;
  mucosal_swelling?: boolean;
  voice_change?: boolean;
  wheeze?: boolean;
}

export interface DehydrationSymptoms {
  skin_turgor?: 'normal' | 'reduced' | 'tented';
  mucous_membranes?: 'moist' | 'dry' | 'very_dry';
  urine_output?: 'normal' | 'reduced' | 'none';
  capillary_refill_seconds?: number | null;
}

export interface ToxicExposureSymptoms {
  substance_ingested?: string | null;
  puncture_marks?: boolean;
  salivation?: 'normal' | 'excessive' | 'dry';
  pupil_size?: 'normal' | 'pinpoint' | 'dilated';
}

export interface SymptomVector {
  infection_sepsis?: InfectionSepsisSymptoms;
  respiratory?: RespiratorySymptoms;
  cardiac?: CardiacSymptoms;
  neurological?: NeurologicalSymptoms;
  blood_pressure?: BloodPressureSymptoms;
  diabetes?: DiabetesSymptoms;
  gastrointestinal?: GastrointestinalSymptoms;
  injury_trauma?: InjuryTraumaSymptoms;
  pregnancy?: PregnancySymptoms;
  allergic?: AllergicSymptoms;
  dehydration?: DehydrationSymptoms;
  toxic_exposure?: ToxicExposureSymptoms;
  // Medical history carried provisionally inside symptom_vector TODO(contract)
  medical_history?: MedicalHistory;
}

export interface MedicalHistory {
  immunosuppression: boolean;
  severe_chronic_comorbidity: boolean;
  comorbidity_note: string | null;
  pregnancy_status?: 'pregnant' | 'not_pregnant' | 'unknown' | 'not_applicable';
}

export interface VitalsInput {
  heart_rate: number | null;
  respiratory_rate: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  oxygen_saturation: number | null;
  temperature_celsius: number | null;
  capillary_blood_glucose: number | null;
}

export interface VitalSignsRecord extends VitalsInput {
  id: string;
  patient_id: string;
  recorded_by: string;
  recorded_at: string;
}

export interface AssessPayloadInput {
  patient_id: string;
  chief_complaint: string;
  symptom_vector: SymptomVector;
  vitals: VitalsInput;
  missing_essential_vitals: string[];
  medical_history: MedicalHistory;
  language: Language;
}

export interface ApiSuccessEnvelope<T> {
  data: T;
  meta: Record<string, unknown>;
  error: null;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorEnvelope {
  data: null;
  meta: Record<string, unknown>;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export interface SessionUser {
  id: string;
  role: IntakeUserRole;
  patientIdScope?: string;
}
