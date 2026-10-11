import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePatientIntake, validateStaffSignIn } from '../../shared/utils/validation';

test('validatePatientIntake - succeeds with valid parameters', () => {
  const result = validatePatientIntake({
    name: 'Jesica Jasmine',
    dateOfBirth: '1995-04-12',
    gender: 'FEMALE',
    primaryLanguage: 'en',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
});

test('validatePatientIntake - fails when name is missing or too short', () => {
  const result = validatePatientIntake({
    name: 'A',
    dateOfBirth: '1995-04-12',
    gender: 'FEMALE',
    primaryLanguage: 'en',
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors[0].field, 'name');
});

test('validatePatientIntake - fails when dateOfBirth is in the future', () => {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2);
  const dobStr = futureDate.toISOString().split('T')[0];

  const result = validatePatientIntake({
    name: 'John Doe',
    dateOfBirth: dobStr,
    gender: 'MALE',
    primaryLanguage: 'en',
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.some((e) => e.field === 'dateOfBirth'), true);
});

test('validatePatientIntake - fails on invalid gender option', () => {
  const result = validatePatientIntake({
    name: 'John Doe',
    dateOfBirth: '1990-01-01',
    gender: 'INVALID_GENDER' as any,
    primaryLanguage: 'en',
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.some((e) => e.field === 'gender'), true);
});

test('validateStaffSignIn - validates email format and password length', () => {
  const invalidEmail = validateStaffSignIn('invalid-email', '123456');
  assert.equal(invalidEmail.isValid, false);

  const shortPass = validateStaffSignIn('nurse@hospital.org', '123');
  assert.equal(shortPass.isValid, false);

  const valid = validateStaffSignIn('nurse@hospital.org', 'securePass123');
  assert.equal(valid.isValid, true);
});
