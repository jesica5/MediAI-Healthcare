import { describe, it, expect } from 'vitest';
import { AuditJournalService } from '../services/auditJournalService';

describe('AuditJournalService Tamper-Evident Integrity & RBAC PHI Redaction', () => {
  it('appends audit events and maintains verifiable cryptographic chain integrity', async () => {
    const event1 = await AuditJournalService.recordEvent({
      event_type: 'USER_SIGN_IN',
      user_id: 'doc_101',
      payload: { role: 'Attending Doctor' },
    });

    const event2 = await AuditJournalService.recordEvent({
      event_type: 'TRIAGE_ASSESSMENT_EXECUTED',
      user_id: 'nurse_202',
      patient_id: 'pt_303',
      payload: { riskScore: 88, category: 'CRITICAL' },
    });

    expect(event1.payload_hash).toHaveLength(64);
    expect(event2.prev_hash).toBeDefined();
    expect(AuditJournalService.verifyIntegrity()).toBe(true);
  });

  it('sanitizes patient plaintext name from payload automatically', async () => {
    const event = await AuditJournalService.recordEvent({
      event_type: 'PATIENT_INTAKE_SUBMITTED',
      patient_id: 'pt_404',
      payload: {
        name: 'John Doe',
        chiefComplaint: 'Chest tightness',
      },
    });

    expect(event.payload?.name).not.toBe('John Doe');
    expect(event.payload?.phi_redacted).toBe(true);
  });

  it('masks patient_id for System Administrator role queries (Zero PHI Mandate)', async () => {
    await AuditJournalService.recordEvent({
      event_type: 'TRIAGE_CATEGORY_OVERRIDDEN',
      patient_id: 'pat_real_uuid_999',
      payload: { override_reason: 'Clinical stability verified' },
    });

    const adminResults = AuditJournalService.queryAuditLog(
      { event_type: 'TRIAGE_CATEGORY_OVERRIDDEN' },
      'System Administrator'
    );

    expect(adminResults.length).toBeGreaterThan(0);
    const lastRecord = adminResults[adminResults.length - 1];
    expect(lastRecord.patient_id).not.toBe('pat_real_uuid_999');
    expect(lastRecord.patient_id).toHaveLength(16); // SHA-256 substring mask
  });
});
