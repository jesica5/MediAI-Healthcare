import { NextRequest, NextResponse } from 'next/server';
import { doctorService } from '@/shared/services/doctorService';
import { createErrorEnvelope } from '@/shared/utils/envelope';

export async function GET(request: NextRequest) {
  try {
    // 1. Enforce Server-Side RBAC Guard (Section 10)
    const roleHeader = request.headers.get('x-user-role') || 'Doctor';
    const allowedRoles = ['Doctor', 'Attending Doctor', 'Triage Nurse', 'System Administrator', 'admin'];

    if (!allowedRoles.includes(roleHeader)) {
      return NextResponse.json(
        createErrorEnvelope(
          'FORBIDDEN',
          'Access restricted to authorized clinical staff.',
          [{ issue: `Role '${roleHeader}' is unauthorized to access medication reconciliation data.` }]
        ),
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId') || 'p-101';

    const response = await doctorService.getMedicationRecords(patientId);

    if (response.error) {
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching medication reconciliation records';
    return NextResponse.json(
      createErrorEnvelope('INTERNAL_SERVER_ERROR', message),
      { status: 500 }
    );
  }
}
