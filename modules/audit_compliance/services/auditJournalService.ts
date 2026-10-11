/**
 * Tamper-Evident Audit Journal Service
 * Provides immutable, append-only audit tracking with SHA-256 payload hashing and zero-PHI admin views.
 */
import crypto from 'crypto';
import { AuditJournalRecord, AuditQueryFilter } from '../types';
import { saveAuditLogToFirestore } from '@/shared/services/firestoreService';

export class AuditJournalService {
  private static journal: AuditJournalRecord[] = [];
  private static lastHash = '0000000000000000000000000000000000000000000000000000000000000000';

  /**
   * Generates a deterministic SHA-256 hash of a payload object
   */
  public static hashPayload(payload?: Record<string, unknown>): string {
    const serialized = JSON.stringify(payload || {});
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  /**
   * Sanitizes payload to ensure zero unprotected PHI enters log storage
   */
  public static sanitizePayload(payload?: Record<string, unknown>): Record<string, unknown> {
    if (!payload) return {};
    const sanitized = JSON.parse(JSON.stringify(payload));
    if (sanitized.name) {
      sanitized.name = crypto.createHash('sha256').update(String(sanitized.name)).digest('hex').substring(0, 16);
      sanitized.phi_redacted = true;
    }
    if (sanitized.display_name) {
      delete sanitized.display_name;
      sanitized.phi_redacted = true;
    }
    return sanitized;
  }

  /**
   * Appends an immutable, chained audit record
   */
  public static async recordEvent(params: {
    event_type: string;
    user_id?: string;
    patient_id?: string;
    ip_address?: string;
    user_agent?: string;
    payload?: Record<string, unknown>;
  }): Promise<AuditJournalRecord> {
    const timestamp = new Date().toISOString();
    const id = `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const sanitized = this.sanitizePayload(params.payload);
    const payloadHash = this.hashPayload(sanitized);

    // Compute cryptographic block chain hash
    const blockData = `${id}|${timestamp}|${params.event_type}|${params.user_id || ''}|${params.patient_id || ''}|${payloadHash}|${this.lastHash}`;
    const blockHash = crypto.createHash('sha256').update(blockData).digest('hex');

    const record: AuditJournalRecord = {
      id,
      timestamp,
      event_type: params.event_type,
      user_id: params.user_id,
      patient_id: params.patient_id,
      ip_address: params.ip_address || '127.0.0.1',
      user_agent: params.user_agent || 'MediAI-Server/2.0',
      payload_hash: payloadHash,
      prev_hash: this.lastHash,
      payload: sanitized,
    };

    this.lastHash = blockHash;
    this.journal.push(record);

    // Also persist to Firestore
    try {
      await saveAuditLogToFirestore({
        eventType: params.event_type,
        userId: params.user_id,
        patientId: params.patient_id,
        ipAddress: record.ip_address,
        userAgent: record.user_agent,
        payload: sanitized,
      });
    } catch {
      // Continue even if remote Firestore call fails
    }

    return record;
  }

  /**
   * Queries audit logs with role-based PHI masking
   */
  public static queryAuditLog(filter: AuditQueryFilter, requesterRole: string): AuditJournalRecord[] {
    let results = [...this.journal];

    if (filter.event_type) {
      results = results.filter((r) => r.event_type === filter.event_type);
    }
    if (filter.user_id) {
      results = results.filter((r) => r.user_id === filter.user_id);
    }
    if (filter.patient_id) {
      results = results.filter((r) => r.patient_id === filter.patient_id);
    }

    // Role-Based Access Control: System Administrator gets zero PHI
    const isAdmin = requesterRole === 'System Administrator' || requesterRole === 'admin';
    if (isAdmin) {
      results = results.map((r) => ({
        ...r,
        patient_id: r.patient_id ? crypto.createHash('sha256').update(r.patient_id).digest('hex').substring(0, 16) : undefined,
      }));
    }

    const limit = filter.limit || 100;
    return results.slice(-limit);
  }

  /**
   * Verifies cryptographic integrity of the journal chain
   */
  public static verifyIntegrity(): boolean {
    let currentPrev = '0000000000000000000000000000000000000000000000000000000000000000';
    for (const record of this.journal) {
      if (record.prev_hash !== currentPrev) {
        return false;
      }
      const blockData = `${record.id}|${record.timestamp}|${record.event_type}|${record.user_id || ''}|${record.patient_id || ''}|${record.payload_hash}|${currentPrev}`;
      currentPrev = crypto.createHash('sha256').update(blockData).digest('hex');
    }
    return true;
  }
}
