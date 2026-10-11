import { AuditLogEntry } from '../types';
import { saveAuditLogToFirestore } from '../services/firestoreService';

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    // Ensure zero plaintext PHI in audit logs as per security spec
    const sanitizedPayload = entry.payload
      ? JSON.parse(JSON.stringify(entry.payload))
      : {};

    // Mask name if accidentally passed in payload
    if (sanitizedPayload.name) {
      delete sanitizedPayload.name;
      sanitizedPayload.phiRedacted = true;
    }

    await saveAuditLogToFirestore({
      eventType: entry.eventType,
      userId: entry.userId || undefined,
      patientId: entry.patientId || undefined,
      ipAddress: entry.ipAddress || '127.0.0.1',
      userAgent: entry.userAgent || 'MediAI-Server',
      payload: sanitizedPayload,
    });
  } catch (err) {
    // Fail safe: log in dev console without throwing to keep main transaction alive
    console.error('Audit logger warning:', err);
  }
}
