import { NextRequest, NextResponse } from 'next/server';
import { doctorService } from '@/shared/services/doctorService';
import { createErrorEnvelope } from '@/shared/utils/envelope';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Enforce Server-Side RBAC Guard (Section 10)
    const roleHeader = request.headers.get('x-user-role') || 'Doctor';
    const allowedRoles = ['Doctor', 'Attending Doctor', 'Triage Nurse', 'System Administrator', 'admin'];

    if (!allowedRoles.includes(roleHeader)) {
      return NextResponse.json(
        createErrorEnvelope(
          'FORBIDDEN',
          'Access restricted to authorized clinical staff with Attending Physician or Triage Nurse privileges.',
          [{ issue: `Role '${roleHeader}' is unauthorized to access patient clinical record.` }]
        ),
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id || id.trim() === '') {
      return NextResponse.json(
        createErrorEnvelope('INVALID_REQUEST', 'Missing required patient or assessment identifier.'),
        { status: 400 }
      );
    }

    // 2. Fetch clinical assessment
    const response = await doctorService.getPatientAssessmentById(id);

    if (response.error) {
      const statusCode = response.error.code === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json(response, { status: statusCode });
    }

    // 3. Admin Zero-PHI Redaction Mandate
    if ((roleHeader === 'System Administrator' || roleHeader === 'admin') && response.data) {
      const sanitized = {
        ...response.data,
        patient: response.data.patient
          ? {
              ...response.data.patient,
              display_name: 'REDACTED (ADMIN_VIEW)',
            }
          : undefined,
      };
      return NextResponse.json({ ...response, data: sanitized }, { status: 200 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error retrieving patient review data';
    return NextResponse.json(
      createErrorEnvelope('INTERNAL_SERVER_ERROR', message),
      { status: 500 }
    );
  }
}
