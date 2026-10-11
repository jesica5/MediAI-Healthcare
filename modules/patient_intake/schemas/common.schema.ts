import { z } from 'zod';

export const languageSchema = z.enum(['en', 'ta']);

export const genderSchema = z.enum(['female', 'male', 'other', 'prefer_not_to_say']);

export const apiErrorDetailSchema = z
  .object({
    field: z.string().optional(),
    message: z.string(),
    code: z.string().optional(),
  })
  .strict();

export const apiErrorEnvelopeSchema = z
  .object({
    data: z.null(),
    meta: z.record(z.unknown()),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.array(apiErrorDetailSchema).optional(),
      })
      .strict(),
  })
  .strict();

export function createSuccessEnvelope<T>(data: T, meta: Record<string, unknown> = {}) {
  return {
    data,
    meta,
    error: null,
  };
}

export function createErrorEnvelope(
  code: string,
  message: string,
  details: { field?: string; message: string; code?: string }[] = [],
  meta: Record<string, unknown> = {}
) {
  return {
    data: null,
    meta,
    error: {
      code,
      message,
      details,
    },
  };
}
