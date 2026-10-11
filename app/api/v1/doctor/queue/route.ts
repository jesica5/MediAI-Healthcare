import { NextRequest, NextResponse } from 'next/server';
import { doctorService } from '@/shared/services/doctorService';
import { AcuityCategory, TriageStatus } from '@/shared/types/triage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = (searchParams.get('status') || 'PENDING_REVIEW') as TriageStatus | 'ALL';
    const category = (searchParams.get('category') || 'ALL') as AcuityCategory | 'ALL';
    const searchQuery = searchParams.get('search') || undefined;

    // Execute doctor service queue query
    const response = await doctorService.getTriageQueue({
      status,
      category,
      searchQuery,
    });

    if (response.error) {
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error retrieving doctor queue';
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
