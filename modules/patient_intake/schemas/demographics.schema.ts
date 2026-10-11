import { z } from 'zod';
import { genderSchema, languageSchema } from './common.schema';

export const demographicsSchema = z
  .object({
    chief_complaint: z
      .string({
        required_error: 'Chief complaint is required',
      })
      .trim()
      .min(1, 'Chief complaint cannot be empty')
      .max(500, 'Chief complaint must be at most 500 characters'),
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
      .nullable()
      .optional(),
    age: z
      .number()
      .int('Age must be an integer')
      .min(0, 'Age cannot be negative')
      .max(130, 'Age exceeds maximum valid human range')
      .nullable()
      .optional(),
    gender: genderSchema,
    primary_language: languageSchema,
  })
  .strict();

export type DemographicsValidated = z.infer<typeof demographicsSchema>;
