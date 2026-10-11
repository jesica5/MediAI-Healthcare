/**
 * Audit & Compliance Module Types
 * Adheres to Section 10 & 11 of the MediAI Master Specification.
 */

export type AuditEventType =
  | 'USER_SIGN_IN'
  | 'USER_SIGN_OUT'
  | 'PATIENT_INTAKE_SUBMITTED'
  | 'TRIAGE_ASSESSMENT_EXECUTED'
  | 'TRIAGE_ASSESSMENT_CONFIRMED'
  | 'TRIAGE_CATEGORY_OVERRIDDEN'
  | 'PATIENT_RECORD_VIEWED'
  | 'SECURITY_AUTHORIZATION_FAILURE'
  | 'MISSING_VITALS_ACKNOWLEDGED'
  | 'SYSTEM_CONFIG_UPDATED';

export interface AuditJournalRecord {
  id: string;
  timestamp: string;
  event_type: AuditEventType | string;
  user_id?: string;
  patient_id?: string;
  ip_address: string;
  user_agent?: string;
  payload_hash: string;
  prev_hash: string;
  payload?: Record<string, unknown>;
}

export interface AuditQueryFilter {
  event_type?: string;
  user_id?: string;
  patient_id?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
}
