import { describe, it, expect } from 'vitest';
import { doctorService } from '@/shared/services/doctorService';
import { ACUITY_CONFIGS } from '@/shared/constants/doctorAcuity';

describe('Doctor Emergency Queue Unit Tests', () => {
  it('should return triage queue sorted by priority: Hard Red-Flags first, then CRITICAL > HIGH > MODERATE > LOW', async () => {
    const res = await doctorService.getTriageQueue({ status: 'PENDING_REVIEW' });
    expect(res.error).toBeNull();
    expect(res.data).toBeDefined();

    const queue = res.data || [];
    expect(queue.length).toBeGreaterThan(0);

    // Verify first items have hard red flags or CRITICAL category
    const firstItem = queue[0];
    expect(firstItem.calculated_category).toBe('CRITICAL');
    expect(firstItem.hard_red_flag_triggered).toBe(true);
  });

  it('should enforce Master Spec acuity hex colors for all 4 bands', () => {
    expect(ACUITY_CONFIGS.CRITICAL.colorHex).toBe('#E53E3E');
    expect(ACUITY_CONFIGS.HIGH.colorHex).toBe('#ED8936');
    expect(ACUITY_CONFIGS.MODERATE.colorHex).toBe('#ECC94B');
    expect(ACUITY_CONFIGS.LOW.colorHex).toBe('#38A169');
  });

  it('should filter queue by acuity category correctly', async () => {
    const res = await doctorService.getTriageQueue({ category: 'HIGH' });
    expect(res.error).toBeNull();
    const items = res.data || [];
    items.forEach(item => {
      expect(item.calculated_category).toBe('HIGH');
    });
  });

  it('should correctly flag missing essential vitals on patient ast-103', async () => {
    const res = await doctorService.getPatientAssessmentById('ast-103');
    expect(res.error).toBeNull();
    expect(res.data?.explainability_payload.missing_vitals_warning).toBe(true);
    expect(res.data?.confidence_score).toBeLessThan(0.7);
  });
});
