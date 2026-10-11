import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encryptPatientName,
  decryptPatientName,
  generateMrnHash,
  maskPatientName,
} from '../../shared/utils/crypto';

test('AES-256-GCM - encrypts and decrypts patient name accurately', () => {
  const originalName = 'Jesica Jasmine J.';
  const encryptedBuffer = encryptPatientName(originalName);

  assert.ok(Buffer.isBuffer(encryptedBuffer));
  assert.ok(encryptedBuffer.length > 28);

  const decryptedName = decryptPatientName(encryptedBuffer);
  assert.equal(decryptedName, originalName);
});

test('SHA-256 MRN Hash - produces 64-character hex string', () => {
  const hash = generateMrnHash('Jesica Jasmine', '1995-04-12', 'FEMALE');

  assert.equal(typeof hash, 'string');
  assert.equal(hash.length, 64);
});

test('maskPatientName - masks PHI for non-authorized roles', () => {
  const maskedFull = maskPatientName('Jesica Jasmine');
  assert.equal(maskedFull, 'J*** J***');

  const maskedSingle = maskPatientName('Jesica');
  assert.equal(maskedSingle, 'J***');
});
