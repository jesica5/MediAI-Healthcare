import { NextRequest, NextResponse } from 'next/server';
import { validateStaffSignIn } from '@/shared/utils/validation';
import { createSuccessEnvelope, createErrorEnvelope } from '@/shared/utils/envelope';
import { logAuditEvent } from '@/shared/utils/auditLogger';
import { UserRole } from '@/shared/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    const validation = validateStaffSignIn(email, password);
    if (!validation.isValid) {
      return NextResponse.json(
        createErrorEnvelope(
          'INVALID_CREDENTIALS',
          'Please provide valid email and password.',
          validation.errors
        ),
        { status: 400 }
      );
    }

    // Role mapping based on staff domain/email pattern for demo & production provisioning
    let assignedRole: UserRole = 'Triage Nurse';
    const emailLower = email.toLowerCase();
    if (emailLower.includes('doctor') || emailLower.includes('doc')) {
      assignedRole = 'Attending Doctor';
    } else if (emailLower.includes('admin') || emailLower.includes('sysadmin')) {
      assignedRole = 'System Administrator';
    }

    // Staff session payload
    const userSession = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: email.trim(),
      role: assignedRole,
      fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
    };

    // Log audit event to Firestore Cloud Firestore audit_logs collection
    await logAuditEvent({
      eventType: 'STAFF_SIGN_IN_SUCCESS',
      userId: userSession.id,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
      payload: { role: assignedRole },
    });

    return NextResponse.json(
      createSuccessEnvelope({
        user: userSession,
        token: 'firebase_id_token_' + Date.now(),
      })
    );
  } catch {
    return NextResponse.json(
      createErrorEnvelope(
        'SERVER_ERROR',
        'An error occurred during authentication.'
      ),
      { status: 500 }
    );
  }
}
