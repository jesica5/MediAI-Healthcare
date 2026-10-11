import { NextRequest, NextResponse } from 'next/server';
import { createSuccessEnvelope } from '@/shared/utils/envelope';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      createSuccessEnvelope({
        authenticated: false,
        user: null,
        role: 'Anonymous Patient',
      })
    );
  }

  return NextResponse.json(
    createSuccessEnvelope({
      authenticated: true,
      role: 'Triage Nurse',
    })
  );
}
