export type UserRole =
  | 'Anonymous Patient'
  | 'Triage Nurse'
  | 'Attending Doctor'
  | 'System Administrator';

export type Language = 'en' | 'ta';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface PatientIntakeInput {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  primaryLanguage: Language;
}

export interface PatientRecord {
  id: string;
  mrnHash: string;
  name?: string; // Decrypted name if role is authorized
  dateOfBirth: string;
  gender: Gender;
  primaryLanguage: Language;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export interface ApiError {
  code: string;
  message: string;
  details: ApiErrorDetail[];
}

export interface ApiMeta {
  timestamp?: string;
  requestId?: string;
  [key: string]: unknown;
}

export interface ApiResponseEnvelope<T = unknown> {
  data: T | null;
  meta: ApiMeta;
  error: ApiError | null;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

export interface AuthSession {
  user: UserProfile | null;
  token: string | null;
  role: UserRole;
}

export interface AuditLogEntry {
  eventType: string;
  userId?: string;
  patientId?: string;
  ipAddress: string;
  userAgent?: string;
  payload?: Record<string, unknown>;
}
