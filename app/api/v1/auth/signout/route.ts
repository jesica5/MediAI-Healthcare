import { NextRequest, NextResponse } from 'next/server';
import { createSuccessEnvelope } from '@/shared/utils/envelope';
import { logAuditEvent } from '@/shared/utils/auditLogger';

export async function POST(req: NextRequest) {
  await logAuditEvent({
    eventType: 'STAFF_SIGN_OUT',
    ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    userAgent: req.headers.get('user-agent') || 'Browser',
  });

  return NextResponse.json(createSuccessEnvelope({ signedOut: true }));
}
