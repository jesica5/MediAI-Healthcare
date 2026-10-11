import { NextRequest, NextResponse } from 'next/server';
import { doctorService } from '@/shared/services/doctorService';
import { DoctorOverridePayload } from '@/shared/types/doctor';

export async function POST(request: NextRequest) {
  try {
    const body: DoctorOverridePayload = await request.json();

    if (!body.assessment_id || !body.final_category) {
      return NextResponse.json(
        {
          data: null,
          meta: {},
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Both assessment_id and final_category are required fields.',
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
