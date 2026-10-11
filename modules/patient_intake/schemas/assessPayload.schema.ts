import { z } from 'zod';
import { vitalsInputSchema, getMissingEssentialVitals } from './vitals.schema';
import { symptomVectorSchema } from './symptomVector.schema';
import { medicalHistorySchema } from './medicalHistory.schema';
import { languageSchema } from './common.schema';

/**
 * Main assess input payload schema for POST /api/v1/triage/assess
 * TODO(contract): The assess input payload shape is provisional and must be confirmed with M3/M4.
 */
export const assessPayloadSchema = z
  .object({
    patient_id: z.string().uuid('patient_id must be a valid UUID'),
    chief_complaint: z
      .string({
        required_error: 'chief_complaint is required',
      })
      .trim()
      .min(1, 'chief_complaint cannot be empty')
      .max(500, 'chief_complaint must be at most 500 characters'),
    symptom_vector: symptomVectorSchema,
    vitals: vitalsInputSchema,
    missing_essential_vitals: z.array(z.string()),
    medical_history: medicalHistorySchema,
    language: languageSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    // Validate that missing_essential_vitals accurately reflects vitals input
    const expectedMissing = getMissingEssentialVitals(data.vitals);
    const setActual = new Set(data.missing_essential_vitals);
    const setExpected = new Set(expectedMissing);

    for (const expected of expectedMissing) {
      if (!setActual.has(expected)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `missing_essential_vitals must include "${expected}" because it was not provided in vitals`,
          path: ['missing_essential_vitals'],
        });
      }
    }

    for (const actual of data.missing_essential_vitals) {
      if (!setExpected.has(actual)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `missing_essential_vitals erroneously includes "${actual}" which was provided in vitals`,
          path: ['missing_essential_vitals'],
        });
      }
    }
  });

export type AssessPayloadValidated = z.infer<typeof assessPayloadSchema>;
