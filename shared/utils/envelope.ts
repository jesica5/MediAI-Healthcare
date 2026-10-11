import { ApiResponseEnvelope, ApiError, ApiErrorDetail } from '../types';

export function createSuccessEnvelope<T>(
  data: T,
  meta: Record<string, unknown> = {}
): ApiResponseEnvelope<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
    error: null,
  };
}

export function createErrorEnvelope(
  code: string,
  message: string,
  details: ApiErrorDetail[] = [],
  meta: Record<string, unknown> = {}
): ApiResponseEnvelope<null> {
  const errorObj: ApiError = {
    code,
    message,
    details,
  };

  return {
    data: null,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
    error: errorObj,
  };
}
