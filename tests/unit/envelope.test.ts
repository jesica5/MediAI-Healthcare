import test from 'node:test';
import assert from 'node:assert/strict';
import { createSuccessEnvelope, createErrorEnvelope } from '../../shared/utils/envelope';

test('createSuccessEnvelope - wraps payload with null error and timestamp meta', () => {
  const payload = { patientId: 'pt_123', status: 'OK' };
  const env = createSuccessEnvelope(payload);

  assert.deepEqual(env.data, payload);
  assert.equal(env.error, null);
  assert.ok(env.meta.timestamp);
});

test('createErrorEnvelope - formats error payload with code, message, and details', () => {
  const env = createErrorEnvelope('INVALID_INPUT', 'Validation failed', [
    { field: 'dateOfBirth', issue: 'Future date' },
  ]);

  assert.equal(env.data, null);
  assert.equal(env.error?.code, 'INVALID_INPUT');
  assert.equal(env.error?.message, 'Validation failed');
  assert.equal(env.error?.details[0].field, 'dateOfBirth');
});
