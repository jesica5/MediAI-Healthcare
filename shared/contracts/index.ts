/**
 * Canonical MediAI API Contracts & Data Transfer Objects (DTOs)
 * Single Source of Truth for cross-module communication.
 */
import { z } from 'zod';
import { AcuityCategory, TriageStatus, TriageAssessment, VitalSigns, ExplainabilityPayload } from '../types/triage';

// -------------------------------------------------------------
// Standard JSON Envelopes (Specification Section 12)
// -------------------------------------------------------------
export interface ApiSuccessEnvelope<T> {
  data: T;
  meta: Record<string, unknown>;
  error: null;
}

export interface ApiErrorDetail {
  field?: string;
  code?: string;
  message: string;
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

// -------------------------------------------------------------
// Triage Assessment Contracts (/api/v1/triage/assess)
// -------------------------------------------------------------
export interface TriageAssessmentResponseData {
  assessment_id: string;
  patient_id: string;
  calculated_risk_score: number;
  calculated_category: AcuityCategory;
  hard_red_flag_triggered: boolean;
  red_flag_details: string[];
  confidence_score: number;
  confidence_level: 'HIGH' | 'LOW';
  status: TriageStatus;
  explainability_payload: ExplainabilityPayload;
  clinical_disclaimer: string;
  missing_essential_vitals: string[];
  risk_explanation?: {
    summary: string;
    identifiedConcerns: string[];
    riskExplanation: string;
    clinicalQuestionsForDoctor: string[];
    disclaimer: string;
  };
}

// -------------------------------------------------------------
// Doctor Queue Contracts (/api/v1/doctor/queue)
// -------------------------------------------------------------
export interface DoctorQueueQuery {
  status?: TriageStatus | 'ALL';
  category?: AcuityCategory | 'ALL';
  search?: string;
}

export interface DoctorQueueResponseData {
  items: TriageAssessment[];
  total: number;
  priority_breakdown: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
}

// -------------------------------------------------------------
// Doctor Override Contracts (/api/v1/doctor/override)
// -------------------------------------------------------------
export const doctorOverrideSchema = z.object({
  assessment_id: z.string().min(1, 'assessment_id is required'),
  doctor_id: z.string().optional().default('usr_doc_default'),
  doctor_name: z.string().optional().default('Dr. Attending Physician'),
  final_category: z.enum(['CRITICAL', 'HIGH', 'MODERATE', 'LOW']),
  override_reason: z.string().optional(),
  clinical_notes: z.string().optional(),
});

export type DoctorOverrideInput = z.infer<typeof doctorOverrideSchema>;

export interface DoctorOverrideResponseData {
  assessment_id: string;
  original_category: AcuityCategory;
  final_category: AcuityCategory;
  is_overridden: boolean;
  status: TriageStatus;
  reviewed_at: string;
}
