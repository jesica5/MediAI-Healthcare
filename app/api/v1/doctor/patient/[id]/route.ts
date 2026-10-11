import { NextRequest, NextResponse } from 'next/server';
import { doctorService } from '@/shared/services/doctorService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const response = await doctorService.getPatientAssessmentById(id);

    if (response.error) {
      return NextResponse.json(response, { status: 404 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error retrieving patient review data';
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
