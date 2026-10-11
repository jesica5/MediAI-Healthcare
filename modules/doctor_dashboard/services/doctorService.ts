/**
 * Doctor Dashboard Core Service
 * Manages Emergency Queue, Physician Sign-Off & Overrides, and Department Metrics (Specification Module 4).
 */
import { TriageAssessment, MedicationRecord, AcuityCategory, TriageStatus } from '@/shared/types/triage';
import { DoctorDashboardMetrics, DoctorOverridePayload, DoctorQueueFilter, AnalyticsAggregate } from '@/shared/types/doctor';
import { MOCK_ASSESSMENTS, MOCK_METRICS, MOCK_ANALYTICS, MOCK_MEDICATION_RECORDS } from '@/shared/services/mockData';
import { ApiResponseEnvelope } from '@/shared/types';
import { createSuccessEnvelope, createErrorEnvelope } from '@/shared/utils/envelope';
import { logAuditEvent } from '@/shared/utils/auditLogger';

function errorResponse<T>(code: string, message: string): ApiResponseEnvelope<T> {
  return createErrorEnvelope(code, message) as unknown as ApiResponseEnvelope<T>;
}

export class DoctorService {
  private assessments: TriageAssessment[] = [...MOCK_ASSESSMENTS];
  private medications: Record<string, MedicationRecord[]> = { ...MOCK_MEDICATION_RECORDS };

  /**
   * Adds a newly submitted assessment directly into the emergency queue
   */
  public addAssessment(assessment: TriageAssessment): void {
    // Check if assessment already exists by ID
    const existingIndex = this.assessments.findIndex((a) => a.id === assessment.id);
    if (existingIndex >= 0) {
      this.assessments[existingIndex] = assessment;
    } else {
      // Prepend to top of queue
      this.assessments.unshift(assessment);
    }
  }

  /**
   * GET /api/v1/doctor/queue?status=PENDING_REVIEW
   */
  async getTriageQueue(filter: DoctorQueueFilter = {}): Promise<ApiResponseEnvelope<TriageAssessment[]>> {
    try {
      let result = [...this.assessments];

      // Filter by status
      if (filter.status && filter.status !== 'ALL') {
        result = result.filter((a) => a.status === filter.status);
      }

      // Filter by acuity category
      if (filter.category && filter.category !== 'ALL') {
        result = result.filter((a) => a.calculated_category === filter.category);
      }

      // Filter by search query (MRN, patient name, or chief complaint)
      if (filter.searchQuery && filter.searchQuery.trim() !== '') {
        const query = filter.searchQuery.toLowerCase();
        result = result.filter(
          (a) =>
            a.chief_complaint.toLowerCase().includes(query) ||
            a.patient?.mrn_hash.toLowerCase().includes(query) ||
            a.patient?.display_name.toLowerCase().includes(query)
        );
      }

      // Sort according to Master Specification:
      // Priority 1: Hard red flags first
      // Priority 2: Acuity category (CRITICAL > HIGH > MODERATE > LOW)
      // Priority 3: Calculated risk score descending
      // Priority 4: Timestamp descending
      const categoryPriority: Record<string, number> = {
        CRITICAL: 1,
        HIGH: 2,
        MODERATE: 3,
        LOW: 4,
      };

      result.sort((a, b) => {
        if (a.hard_red_flag_triggered && !b.hard_red_flag_triggered) return -1;
        if (!a.hard_red_flag_triggered && b.hard_red_flag_triggered) return 1;

        const priorityA = categoryPriority[a.calculated_category] || 99;
        const priorityB = categoryPriority[b.calculated_category] || 99;
        if (priorityA !== priorityB) return priorityA - priorityB;

        if (a.calculated_risk_score !== b.calculated_risk_score) {
          return b.calculated_risk_score - a.calculated_risk_score;
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      return createSuccessEnvelope(result, { total: result.length, source: 'MediAI_DoctorService' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch doctor queue';
      return errorResponse<TriageAssessment[]>('QUEUE_FETCH_ERROR', message);
    }
  }

  /**
   * GET /api/v1/doctor/patient/[id]
   */
  async getPatientAssessmentById(id: string): Promise<ApiResponseEnvelope<TriageAssessment>> {
    try {
      const assessment = this.assessments.find((a) => a.id === id || a.patient_id === id);
      if (!assessment) {
        return errorResponse<TriageAssessment>('NOT_FOUND', `Patient clinical assessment for ID '${id}' not found.`);
      }
      return createSuccessEnvelope(assessment);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching patient review data';
      return errorResponse<TriageAssessment>('ASSESSMENT_FETCH_ERROR', message);
    }
  }

  /**
   * POST /api/v1/doctor/override
   * Records physician sign-off or clinical override with mandatory rationale
   */
  async submitDoctorOverride(
    payload: DoctorOverridePayload
  ): Promise<ApiResponseEnvelope<{ assessment_id: string; status: string; final_category: string }>> {
    type OverrideResult = { assessment_id: string; status: string; final_category: string };
    try {
      const index = this.assessments.findIndex((a) => a.id === payload.assessment_id);
      if (index === -1) {
        return errorResponse<OverrideResult>('NOT_FOUND', `Assessment '${payload.assessment_id}' not found.`);
      }

      const current = this.assessments[index];

      // Safety rule validation: Never allow silent downgrade of hard red flag P1 Critical result
      if (
        current.hard_red_flag_triggered &&
        current.calculated_category === 'CRITICAL' &&
        payload.final_category !== 'CRITICAL'
      ) {
        if (!payload.override_reason || payload.override_reason.trim().length < 15) {
          return errorResponse<OverrideResult>(
            'SAFETY_RULE_VIOLATION',
            'CRITICAL SAFETY WARNING: A Tier-1 Physiological Red Flag was triggered. Downgrading a Critical assessment requires explicit clinical justification (minimum 15 characters).'
          );
        }
      }

      // Check mandatory rationale requirement for any override
      const isOverridden = current.calculated_category !== payload.final_category;
      if (isOverridden && (!payload.override_reason || payload.override_reason.trim() === '')) {
        return errorResponse<OverrideResult>(
          'MISSING_RATIONALE',
          'Clinical rationale is mandatory when overriding the server-calculated triage acuity category.'
        );
      }

      // Update assessment state
      const newStatus: TriageStatus = isOverridden ? 'OVERRIDDEN' : 'CONFIRMED';
      this.assessments[index] = {
        ...current,
        status: newStatus,
      };

      // Record audit event
      await logAuditEvent({
        eventType: isOverridden ? 'TRIAGE_CATEGORY_OVERRIDDEN' : 'TRIAGE_ASSESSMENT_CONFIRMED',
        userId: payload.doctor_id || 'usr_doc_default',
        patientId: current.patient_id,
        ipAddress: '127.0.0.1',
        payload: {
          assessment_id: payload.assessment_id,
          original_category: current.calculated_category,
          final_category: payload.final_category,
          is_overridden: isOverridden,
          override_reason: payload.override_reason,
        },
      });

      return createSuccessEnvelope(
        {
          assessment_id: payload.assessment_id,
          status: newStatus,
          final_category: payload.final_category,
        },
        {
          timestamp: new Date().toISOString(),
          audited: true,
        }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to record doctor override';
      return errorResponse<OverrideResult>('OVERRIDE_SUBMISSION_ERROR', message);
    }
  }

  /**
   * GET overview metrics
   */
  async getDashboardMetrics(): Promise<ApiResponseEnvelope<DoctorDashboardMetrics>> {
    const pending = this.assessments.filter((a) => a.status === 'PENDING_REVIEW');
    const critical = pending.filter((a) => a.calculated_category === 'CRITICAL').length;
    const high = pending.filter((a) => a.calculated_category === 'HIGH').length;

    return createSuccessEnvelope({
      ...MOCK_METRICS,
      pending_review_count: pending.length,
      critical_count: critical,
      high_priority_count: high,
    });
  }

  /**
   * GET analytics metrics
   */
  async getAnalyticsData(): Promise<ApiResponseEnvelope<AnalyticsAggregate>> {
    return createSuccessEnvelope(MOCK_ANALYTICS);
  }

  /**
   * GET patient medication records
   */
  async getMedicationRecords(patientId: string): Promise<ApiResponseEnvelope<MedicationRecord[]>> {
    const records = this.medications[patientId] || [];
    return createSuccessEnvelope(records);
  }
}

const globalForDoctor = globalThis as unknown as { doctorServiceInstance?: DoctorService };
export const doctorService = globalForDoctor.doctorServiceInstance || new DoctorService();
if (process.env.NODE_ENV !== 'production') {
  globalForDoctor.doctorServiceInstance = doctorService;
}
