import { describe, it, expect, vi } from 'vitest';

// Mock remote network audit logger to keep unit tests fast and independent of Firestore network latency
vi.mock('@/shared/utils/auditLogger', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

import { doctorService } from '@/shared/services/doctorService';

describe('Doctor Override & Red-Flag Safety Tests', () => {
  it('should require mandatory clinical rationale when overriding triage category', async () => {
    const res = await doctorService.submitDoctorOverride({
      assessment_id: 'ast-102',
      doctor_id: 'doc-bhuvana-9982-uuid',
      final_category: 'MODERATE',
      override_reason: '', // Missing rationale
    });

    expect(res.data).toBeNull();
    expect(res.error).toBeDefined();
    expect(res.error?.code).toBe('MISSING_RATIONALE');
  });

  it('should prevent silent downgrading of Tier-1 Hard Red Flag Critical result without detailed rationale', async () => {
    const res = await doctorService.submitDoctorOverride({
      assessment_id: 'ast-104', // Hard red flag CRITICAL patient
      doctor_id: 'doc-bhuvana-9982-uuid',
      final_category: 'MODERATE', // Attempting downgrade
      override_reason: 'Short note', // Too short for red flag downgrade
    });

    expect(res.data).toBeNull();
    expect(res.error).toBeDefined();
    expect(res.error?.code).toBe('SAFETY_RULE_VIOLATION');
  });

  it('should successfully record physician sign-off when rationale is provided', async () => {
    const res = await doctorService.submitDoctorOverride({
      assessment_id: 'ast-102',
      doctor_id: 'doc-bhuvana-9982-uuid',
      final_category: 'MODERATE',
      override_reason: 'Patient showed symptomatic improvement after bedside nebulization and blood pressure stabilization.',
    });

    expect(res.error).toBeNull();
    expect(res.data?.status).toBe('OVERRIDDEN');
    expect(res.data?.final_category).toBe('MODERATE');
  });
});
