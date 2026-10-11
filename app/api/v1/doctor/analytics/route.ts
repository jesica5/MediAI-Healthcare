import { NextRequest, NextResponse } from 'next/server';
import { doctorService } from '@/shared/services/doctorService';

export async function GET(request: NextRequest) {
  try {
    const response = await doctorService.getAnalyticsData();
    return NextResponse.json(response, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error retrieving analytics data';
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
