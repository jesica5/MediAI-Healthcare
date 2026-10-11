import { TriageAssessment, MedicationRecord } from '../types/triage';
import { DoctorDashboardMetrics, DoctorOverridePayload, DoctorQueueFilter, AnalyticsAggregate } from '../types/doctor';
import { MOCK_ASSESSMENTS, MOCK_METRICS, MOCK_ANALYTICS, MOCK_MEDICATION_RECORDS } from './mockData';
import { ApiResponseEnvelope } from '../types';
import { createSuccessEnvelope, createErrorEnvelope } from '../utils/envelope';

function errorResponse<T>(code: string, message: string): ApiResponseEnvelope<T> {
  return createErrorEnvelope(code, message) as unknown as ApiResponseEnvelope<T>;
}

class DoctorService {
  private assessments: TriageAssessment[] = [...MOCK_ASSESSMENTS];
  private medications: Record<string, MedicationRecord[]> = { ...MOCK_MEDICATION_RECORDS };

  /**
   * GET /api/v1/doctor/queue?status=PENDING_REVIEW
   */
  async getTriageQueue(filter: DoctorQueueFilter = {}): Promise<ApiResponseEnvelope<TriageAssessment[]>> {
    try {
      let result = [...this.assessments];

      // Filter by status if requested
      if (filter.status && filter.status !== 'ALL') {
        result = result.filter(a => a.status === filter.status);
      }

      // Filter by acuity category
      if (filter.category && filter.category !== 'ALL') {
        result = result.filter(a => a.calculated_category === filter.category);
      }

      // Filter by search query (patient ID or chief complaint)
      if (filter.searchQuery && filter.searchQuery.trim() !== '') {
        const query = filter.searchQuery.toLowerCase();
        result = result.filter(a => 
          a.chief_complaint.toLowerCase().includes(query) ||
          a.patient?.mrn_hash.toLowerCase().includes(query) ||
          a.patient?.display_name.toLowerCase().includes(query)
        );
      }

      // Sort by server-provided priority according to master spec
      const categoryPriority: Record<string, number> = {
        CRITICAL: 1,
        HIGH: 2,
        MODERATE: 3,
        LOW: 4,
      };

      result.sort((a, b) => {
        // Priority 1: Hard red flags first
        if (a.hard_red_flag_triggered && !b.hard_red_flag_triggered) return -1;
        if (!a.hard_red_flag_triggered && b.hard_red_flag_triggered) return 1;

        // Priority 2: Acuity category (CRITICAL > HIGH > MODERATE > LOW)
        const priorityA = categoryPriority[a.calculated_category] || 99;
        const priorityB = categoryPriority[b.calculated_category] || 99;
        if (priorityA !== priorityB) return priorityA - priorityB;

        // Priority 3: Risk Score descending
        if (a.calculated_risk_score !== b.calculated_risk_score) {
          return b.calculated_risk_score - a.calculated_risk_score;
        }

        // Priority 4: Assessment date descending
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      return createSuccessEnvelope(result, { total: result.length, source: 'MediAI_Service' });
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
      const assessment = this.assessments.find(a => a.id === id || a.patient_id === id);
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
   */
  async submitDoctorOverride(payload: DoctorOverridePayload): Promise<ApiResponseEnvelope<{ assessment_id: string; status: string; final_category: string }>> {
    type OverrideResult = { assessment_id: string; status: string; final_category: string };
    try {
      const index = this.assessments.findIndex(a => a.id === payload.assessment_id);
      if (index === -1) {
        return errorResponse<OverrideResult>('NOT_FOUND', `Assessment '${payload.assessment_id}' not found.`);
      }

      const current = this.assessments[index];

      // Safety rule validation: Never allow silent downgrade of hard red flag P1 Critical result
      if (current.hard_red_flag_triggered && current.calculated_category === 'CRITICAL' && payload.final_category !== 'CRITICAL') {
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
      this.assessments[index] = {
        ...current,
        status: isOverridden ? 'OVERRIDDEN' : 'CONFIRMED',
      };

      return createSuccessEnvelope({
        assessment_id: payload.assessment_id,
        status: this.assessments[index].status,
        final_category: payload.final_category,
      }, {
        timestamp: new Date().toISOString(),
        audited: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to record doctor override';
      return errorResponse<OverrideResult>('OVERRIDE_SUBMISSION_ERROR', message);
    }
  }

  /**
   * GET overview metrics
   */
  async getDashboardMetrics(): Promise<ApiResponseEnvelope<DoctorDashboardMetrics>> {
    const pending = this.assessments.filter(a => a.status === 'PENDING_REVIEW');
    const critical = pending.filter(a => a.calculated_category === 'CRITICAL').length;
    const high = pending.filter(a => a.calculated_category === 'HIGH').length;

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

export const doctorService = new DoctorService();
