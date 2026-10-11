import { z } from 'zod';

/**
 * Medical History Schema
 * Minimum necessary comorbidity information
 * TODO(contract): Medical history has no dedicated DB table; provisionally embedded in assess payload.
 */
export const medicalHistorySchema = z
  .object({
    immunosuppression: z.boolean({
      required_error: 'Immunosuppression status is required',
    }),
    severe_chronic_comorbidity: z.boolean({
      required_error: 'Severe chronic comorbidity status is required',
    }),
    comorbidity_note: z
      .string()
      .max(200, 'Comorbidity note must not exceed 200 characters')
      .nullable()
      .optional(),
    pregnancy_status: z
      .enum(['pregnant', 'not_pregnant', 'unknown', 'not_applicable'])
      .optional()
      .nullable(),
  })
  .strict();

export type MedicalHistoryValidated = z.infer<typeof medicalHistorySchema>;
