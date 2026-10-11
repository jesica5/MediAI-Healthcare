import { NextRequest, NextResponse } from 'next/server';
import { validatePatientIntake } from '@/shared/utils/validation';
import { createSuccessEnvelope, createErrorEnvelope } from '@/shared/utils/envelope';
import { encryptPatientName, generateMrnHash } from '@/shared/utils/crypto';
import { logAuditEvent } from '@/shared/utils/auditLogger';
import { createPatientProfile } from '@/shared/services/firestoreService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Server-side input validation
    const validation = validatePatientIntake(body);
    if (!validation.isValid) {
      return NextResponse.json(
        createErrorEnvelope(
          'VALIDATION_FAILED',
          'Invalid demographic intake parameters provided.',
          validation.errors
        ),
        { status: 400 }
      );
    }

    const { name, dateOfBirth, gender, primaryLanguage } = body;

    // 2. AES-256-GCM encryption and SHA-256 MRN hashing
    const encryptedNameBuffer = encryptPatientName(name);
    const mrnHash = generateMrnHash(name, dateOfBirth, gender);

    // 3. Store in Cloud Firestore (`patients` collection)
    const patientRecord = await createPatientProfile({
      mrnHash,
      encryptedName: encryptedNameBuffer.toString('hex'),
      dateOfBirth,
      gender,
      primaryLanguage: primaryLanguage || 'en',
    });

    // 4. Log Audit Event to Firestore (Zero PHI in log payload)
    await logAuditEvent({
      eventType: 'PATIENT_INTAKE_CREATED',
      patientId: patientRecord.id,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
      payload: {
        mrnHash: patientRecord.mrnHash,
        gender: patientRecord.gender,
        primaryLanguage: patientRecord.primaryLanguage,
      },
    });

    // 5. Return standardized success response envelope
    return NextResponse.json(
      createSuccessEnvelope(
        {
          id: patientRecord.id,
          mrnHash: patientRecord.mrnHash,
          dateOfBirth: patientRecord.dateOfBirth,
          gender: patientRecord.gender,
          primaryLanguage: patientRecord.primaryLanguage,
          createdAt: patientRecord.createdAt,
          sessionToken: 'pt_token_' + patientRecord.id + '_' + Date.now(),
        },
        { status: 'CREATED' }
      ),
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      createErrorEnvelope(
        'INTAKE_SUBMISSION_ERROR',
        'An error occurred while processing patient demographic intake.'
      ),
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Authorization check for listing patients (Staff only)
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json(
      createErrorEnvelope(
        'UNAUTHORIZED',
        'Staff authorization is required to access patient list.'
      ),
      { status: 401 }
    );
  }

  return NextResponse.json(
    createSuccessEnvelope({
      patients: [],
      note: 'Search by MRN hash or UUID required.',
    })
  );
}
