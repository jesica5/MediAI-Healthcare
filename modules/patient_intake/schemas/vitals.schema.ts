import { z } from 'zod';

/**
 * Decimal precision validator: checks maximum allowed decimal places
 */
const maxDecimals = (decimals: number) => (val: number | null | undefined) => {
  if (val === null || val === undefined) return true;
  if (!Number.isFinite(val)) return false;
  const factor = Math.pow(10, decimals);
  return Math.abs(Math.round(val * factor) - val * factor) < 1e-6;
};

/**
 * Base numeric checks: finite, non-NaN, non-negative
 */
const baseIntegerSchema = (min: number, max: number, fieldName: string) =>
  z
    .number({
      invalid_type_error: `${fieldName} must be a number`,
    })
    .int(`${fieldName} must be a whole number (integer)`)
    .min(min, `${fieldName} must be at least ${min}`)
    .max(max, `${fieldName} must be at most ${max}`);

const baseDecimalSchema = (min: number, max: number, decimals: number, fieldName: string) =>
  z
    .number({
      invalid_type_error: `${fieldName} must be a number`,
    })
    .min(min, `${fieldName} must be at least ${min}`)
    .max(max, `${fieldName} must be at most ${max}`)
    .refine((val) => Number.isFinite(val), {
      message: `${fieldName} must be a finite number`,
    })
    .refine(maxDecimals(decimals), {
      message: `${fieldName} exceeds maximum allowed precision of ${decimals} decimal place(s)`,
    });

/**
 * Vitals input schema matching database CHECK constraints exactly
 */
export const vitalsInputSchema = z
  .object({
    heart_rate: baseIntegerSchema(20, 300, 'Heart rate').nullable().optional(),
    respiratory_rate: baseIntegerSchema(4, 80, 'Respiratory rate').nullable().optional(),
    systolic_bp: baseIntegerSchema(40, 300, 'Systolic blood pressure').nullable().optional(),
    diastolic_bp: baseIntegerSchema(20, 200, 'Diastolic blood pressure').nullable().optional(),
    oxygen_saturation: baseDecimalSchema(40.0, 100.0, 1, 'Oxygen saturation').nullable().optional(),
    temperature_celsius: baseDecimalSchema(30.0, 45.0, 2, 'Temperature').nullable().optional(),
    // TODO(contract): Blood glucose range is provisional (20.0-800.0 mg/dL). Confirm with clinical team.
    capillary_blood_glucose: baseDecimalSchema(20.0, 800.0, 1, 'Blood glucose').nullable().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    // Blood pressure relationship check: Diastolic BP must be lower than Systolic BP
    if (
      data.systolic_bp !== null &&
      data.systolic_bp !== undefined &&
      data.diastolic_bp !== null &&
      data.diastolic_bp !== undefined
    ) {
      if (data.diastolic_bp >= data.systolic_bp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Diastolic blood pressure must be lower than systolic blood pressure',
          path: ['diastolic_bp'],
        });
      }
    }
  });

export type VitalsInputValidated = z.infer<typeof vitalsInputSchema>;

/**
 * Essential vitals: SpO2, SBP, Heart Rate
 */
export const ESSENTIAL_VITALS = [
  'oxygen_saturation',
  'systolic_bp',
  'heart_rate',
] as const;

export type EssentialVitalKey = (typeof ESSENTIAL_VITALS)[number];

export function getMissingEssentialVitals(vitals: Partial<Record<string, number | null | undefined>>): string[] {
  const missing: string[] = [];
  if (vitals.oxygen_saturation === null || vitals.oxygen_saturation === undefined) {
    missing.push('oxygen_saturation');
  }
  if (vitals.systolic_bp === null || vitals.systolic_bp === undefined) {
    missing.push('systolic_bp');
  }
  if (vitals.heart_rate === null || vitals.heart_rate === undefined) {
    missing.push('heart_rate');
  }
  return missing;
}
