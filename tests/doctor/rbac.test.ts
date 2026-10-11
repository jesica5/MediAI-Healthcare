import { describe, it, expect } from 'vitest';
import { createSuccessEnvelope, createErrorEnvelope } from '@/shared/utils/envelope';

describe('Standard API Envelope & Security Boundary Tests', () => {
  it('should construct standard success envelope matching { data, meta, error: null }', () => {
    const payload = { queue_count: 5 };
    const envelope = createSuccessEnvelope(payload, { version: 'v1' });

    expect(envelope.data).toEqual(payload);
    expect(envelope.meta.version).toBe('v1');
    expect(envelope.error).toBeNull();
  });

  it('should construct standard error envelope matching { data: null, meta, error: { code, message, details } }', () => {
    const envelope = createErrorEnvelope('UNAUTHORIZED', 'Access denied to doctor workstation', [
      { issue: 'Role mismatch' },
    ]);

    expect(envelope.data).toBeNull();
    expect(envelope.error).toBeDefined();
    expect(envelope.error?.code).toBe('UNAUTHORIZED');
    expect(envelope.error?.message).toBe('Access denied to doctor workstation');
    expect(envelope.error?.details).toEqual([{ issue: 'Role mismatch' }]);
  });
});
