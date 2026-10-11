import { NextRequest, NextResponse } from 'next/server';
import { doctorService } from '@/shared/services/doctorService';
import { DoctorOverridePayload } from '@/shared/types/doctor';

export async function POST(request: NextRequest) {
  try {
    // Enforce Attending Doctor ONLY guard
    const userRole = request.headers.get('x-user-role') || 'Doctor';
    if (userRole !== 'Doctor') {
      return NextResponse.json(
        {
          data: null,
          meta: {},
          error: {
            code: 'FORBIDDEN',
            message: 'Attending Doctor credentials required to execute clinical triage review or override.',
            details: [],
          },
        },
        { status: 403 }
      );
    }

    let body: DoctorOverridePayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          data: null,
          meta: {},
          error: {
            code: 'INVALID_JSON',
            message: 'Request body must be valid JSON.',
            details: [],
          },
        },
        { status: 400 }
      );
    }

    const validCategories = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'];
    if (!body || !body.assessment_id || !body.final_category || !validCategories.includes(body.final_category)) {
      return NextResponse.json(
        {
          data: null,
          meta: {},
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'assessment_id and valid final_category (CRITICAL | HIGH | MODERATE | LOW) are required.',
            details: [],
          },
        },
        { status: 400 }
      );
    }

    // Process physician sign-off & override through application service
    const response = await doctorService.submitDoctorOverride(body);

    if (response.error) {
      const statusCode = response.error.code === 'SAFETY_RULE_VIOLATION' ? 422 : 400;
      return NextResponse.json(response, { status: statusCode });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error recording doctor override';
    return NextResponse.json(
      {
        data: null,
        meta: {},
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message,
          details: [],
        },
      },
      { status: 500 }
    );
  }
}
