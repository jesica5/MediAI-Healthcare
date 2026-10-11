import { NextRequest, NextResponse } from 'next/server';
import { doctorService } from '@/shared/services/doctorService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId') || 'p-101';

    const response = await doctorService.getMedicationRecords(patientId);
    return NextResponse.json(response, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching medication reconciliation records';
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
