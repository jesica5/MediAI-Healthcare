import { PatientIntakeInput, ApiErrorDetail, Gender, Language } from '../types';

export const ALLOWED_GENDERS: Gender[] = [
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
];

export const ALLOWED_LANGUAGES: Language[] = ['en', 'ta'];

export function validatePatientIntake(input: Partial<PatientIntakeInput>): {
  isValid: boolean;
  errors: ApiErrorDetail[];
} {
  const errors: ApiErrorDetail[] = [];

  // Name validation
  if (!input.name || typeof input.name !== 'string' || input.name.trim().length < 2) {
    errors.push({
      field: 'name',
      issue: 'Patient full name is required and must be at least 2 characters long.',
    });
  } else if (input.name.trim().length > 100) {
    errors.push({
      field: 'name',
      issue: 'Patient full name cannot exceed 100 characters.',
    });
  }

  // Date of Birth validation
  if (!input.dateOfBirth || typeof input.dateOfBirth !== 'string') {
    errors.push({
      field: 'dateOfBirth',
      issue: 'Date of birth is required.',
    });
  } else {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(input.dateOfBirth)) {
      errors.push({
        field: 'dateOfBirth',
        issue: 'Date of birth must be formatted as YYYY-MM-DD.',
      });
    } else {
      const dobDate = new Date(input.dateOfBirth);
      const now = new Date();
      if (isNaN(dobDate.getTime())) {
        errors.push({
          field: 'dateOfBirth',
          issue: 'Date of birth is not a valid date.',
        });
      } else if (dobDate > now) {
        errors.push({
          field: 'dateOfBirth',
          issue: 'Date of birth cannot be in the future.',
        });
      } else {
        const ageYears = (now.getTime() - dobDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (ageYears > 125) {
          errors.push({
            field: 'dateOfBirth',
            issue: 'Date of birth indicates an age greater than 125 years.',
          });
        }
      }
    }
  }

  // Gender validation
  if (!input.gender || !ALLOWED_GENDERS.includes(input.gender as Gender)) {
    errors.push({
      field: 'gender',
      issue: `Gender is required and must be one of: ${ALLOWED_GENDERS.join(', ')}.`,
    });
  }

  // Primary Language validation
  if (
    !input.primaryLanguage ||
    !ALLOWED_LANGUAGES.includes(input.primaryLanguage as Language)
  ) {
    errors.push({
      field: 'primaryLanguage',
      issue: `Primary language must be one of: ${ALLOWED_LANGUAGES.join(', ')}.`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateStaffSignIn(email?: string, password?: string): {
  isValid: boolean;
  errors: ApiErrorDetail[];
} {
  const errors: ApiErrorDetail[] = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push({
      field: 'email',
      issue: 'A valid staff email address is required.',
    });
  }

  if (!password || password.length < 6) {
    errors.push({
      field: 'password',
      issue: 'Password must be at least 6 characters long.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
