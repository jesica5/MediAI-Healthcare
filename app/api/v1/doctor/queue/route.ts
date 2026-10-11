import { NextRequest, NextResponse } from 'next/server';
import { doctorService } from '@/shared/services/doctorService';
import { AcuityCategory, TriageStatus } from '@/shared/types/triage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = (searchParams.get('status') || 'PENDING_REVIEW') as TriageStatus | 'ALL';
    const category = (searchParams.get('category') || 'ALL') as AcuityCategory | 'ALL';
    const searchQuery = searchParams.get('search') || undefined;

    // Enforce RBAC: Doctor + Triage Nurse + Admin (read-only zero PHI)
    const roleHeader = request.headers.get('x-user-role') || 'Doctor';
    if (roleHeader !== 'Doctor' && roleHeader !== 'Triage Nurse' && roleHeader !== 'System Administrator' && roleHeader !== 'admin') {
      return NextResponse.json(
        {
          data: null,
          meta: {},
          error: {
            code: 'FORBIDDEN',
            message: 'Access restricted to authorized clinical staff.',
            details: [],
          },
        },
        { status: 403 }
      );
    }

    // Execute doctor service queue query
    const response = await doctorService.getTriageQueue({
      status,
      category,
      searchQuery,
    });

    if (response.error) {
      return NextResponse.json(response, { status: 400 });
    }

    // Zero-PHI Mandate for administrative view
    if ((roleHeader === 'System Administrator' || roleHeader === 'admin') && response.data) {
      const sanitizedData = response.data.map((item) => ({
        ...item,
        patient: item.patient
          ? {
              ...item.patient,
              display_name: 'REDACTED (ADMIN_VIEW)',
            }
          : undefined,
      }));
      return NextResponse.json({ ...response, data: sanitizedData }, { status: 200 });
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
