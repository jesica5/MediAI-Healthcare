import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock remote network audit logger to keep unit tests fast and independent of Firestore network latency
vi.mock('@/shared/utils/auditLogger', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

import { DoctorService } from '@/modules/doctor_dashboard/services/doctorService';
import { TriageAssessment } from '@/shared/types/triage';

describe('Doctor Dashboard Module Core Invariants & Unit Tests', () => {
  let service: DoctorService;

  beforeEach(() => {
    service = new DoctorService();
  });

  describe('Emergency Triage Queue Sorting Invariants', () => {
    it('should sort hard red-flag patients strictly before non-red-flag patients regardless of score', async () => {
      const res = await service.getTriageQueue({ status: 'PENDING_REVIEW' });
      expect(res.error).toBeNull();
      const queue = res.data || [];

      let seenNonRedFlag = false;
      for (const item of queue) {
        if (!item.hard_red_flag_triggered) {
          seenNonRedFlag = true;
        } else if (seenNonRedFlag) {
          // A red-flag appeared after a non-red-flag item — invariant violated!
          expect.fail('Hard red-flag patient found after a non-red-flag patient in queue');
        }
      }
    });

    it('should enforce descending acuity band priority order (CRITICAL > HIGH > MODERATE > LOW)', async () => {
      const res = await service.getTriageQueue({ status: 'ALL' });
      const queue = res.data || [];

      const categoryRank: Record<string, number> = {
        CRITICAL: 1,
        HIGH: 2,
        MODERATE: 3,
        LOW: 4,
      };

      // Filter to items without hard red flags to isolate the acuity band ordering
      const nonRedFlagItems = queue.filter((i) => !i.hard_red_flag_triggered);

      for (let i = 0; i < nonRedFlagItems.length - 1; i++) {
        const curr = nonRedFlagItems[i];
        const next = nonRedFlagItems[i + 1];

        const rankCurr = categoryRank[curr.calculated_category] || 99;
        const rankNext = categoryRank[next.calculated_category] || 99;

        expect(rankCurr).toBeLessThanOrEqual(rankNext);
      }
    });

    it('should break ties using calculated risk score descending', async () => {
      const res = await service.getTriageQueue({ status: 'ALL' });
      const queue = res.data || [];

      for (let i = 0; i < queue.length - 1; i++) {
        const a = queue[i];
        const b = queue[i + 1];

        // Same red flag and same category
        if (
          a.hard_red_flag_triggered === b.hard_red_flag_triggered &&
          a.calculated_category === b.calculated_category
        ) {
          expect(a.calculated_risk_score).toBeGreaterThanOrEqual(b.calculated_risk_score);
        }
      }
    });
  });

  describe('Search & Filter Capabilities', () => {
    it('should filter by chief complaint query', async () => {
      const res = await service.getTriageQueue({ searchQuery: 'chest pain' });
      expect(res.error).toBeNull();
      const items = res.data || [];
      expect(items.length).toBeGreaterThan(0);
      items.forEach((item) => {
        expect(item.chief_complaint.toLowerCase()).toContain('chest pain');
      });
    });

    it('should filter by patient MRN hash query', async () => {
      const res = await service.getTriageQueue({ searchQuery: 'MRN-849201' });
      expect(res.error).toBeNull();
      const items = res.data || [];
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].patient?.mrn_hash).toBe('MRN-849201');
    });

    it('should filter by review status', async () => {
      const res = await service.getTriageQueue({ status: 'PENDING_REVIEW' });
      expect(res.error).toBeNull();
      const items = res.data || [];
      items.forEach((item) => {
        expect(item.status).toBe('PENDING_REVIEW');
      });
    });
  });

  describe('Physician Override & Safety Rules', () => {
    it('should reject overriding calculated category without rationale', async () => {
      const res = await service.submitDoctorOverride({
        assessment_id: 'ast-102',
        doctor_id: 'doc-bhuvana-9982-uuid',
        final_category: 'LOW',
        override_reason: '   ', // whitespace only
      });

      expect(res.data).toBeNull();
      expect(res.error?.code).toBe('MISSING_RATIONALE');
    });

    it('should enforce at least 15 characters rationale for downgrading Critical red-flag patients', async () => {
      const res = await service.submitDoctorOverride({
        assessment_id: 'ast-104',
        doctor_id: 'doc-bhuvana-9982-uuid',
        final_category: 'HIGH',
        override_reason: 'Patient ok now', // 14 characters
      });

      expect(res.data).toBeNull();
      expect(res.error?.code).toBe('SAFETY_RULE_VIOLATION');
    });

    it('should allow confirming assessment without changing category and without mandatory rationale', async () => {
      const res = await service.submitDoctorOverride({
        assessment_id: 'ast-102',
        doctor_id: 'doc-bhuvana-9982-uuid',
        final_category: 'HIGH', // Same as calculated_category
        clinical_notes: 'Confirmed by Dr. Bhuvana M.V. at bedside.',
      });

      expect(res.error).toBeNull();
      expect(res.data?.status).toBe('CONFIRMED');
      expect(res.data?.final_category).toBe('HIGH');
    });
  });

  describe('Overview Metrics & Medication Records', () => {
    it('should compute real-time pending, critical, and high priority metrics', async () => {
      const res = await service.getDashboardMetrics();
      expect(res.error).toBeNull();
      expect(res.data).toBeDefined();
      expect(res.data?.pending_review_count).toBeGreaterThan(0);
      expect(res.data?.critical_count).toBeGreaterThanOrEqual(1);
    });

    it('should return medication reconciliation records for known patient', async () => {
      const res = await service.getMedicationRecords('p-101');
      expect(res.error).toBeNull();
      expect(res.data).toBeDefined();
      expect(res.data?.length).toBeGreaterThan(0);
      expect(res.data?.[0].patient_id).toBe('p-101');
    });

    it('should return empty list for patient with no medication history', async () => {
      const res = await service.getMedicationRecords('p-999-unknown');
      expect(res.error).toBeNull();
      expect(res.data).toEqual([]);
    });
  });
});
