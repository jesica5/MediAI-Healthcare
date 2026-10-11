import { NextRequest, NextResponse } from 'next/server';
import { createSuccessEnvelope, createErrorEnvelope } from '@/shared/utils/envelope';
import { logAuditEvent } from '@/shared/utils/auditLogger';
import { getPatientProfileById, getLatestRiskPredictionByPatientId, getMedicalHistoryByPatientId } from '@/shared/services/firestoreService';

export async function GET(req: NextRequest) {
  try {
    const tokenHeader = req.headers.get('x-patient-token') || req.headers.get('authorization');

    if (!tokenHeader) {
      return NextResponse.json(
        createErrorEnvelope(
          'UNAUTHORIZED_SESSION',
          'No valid patient session or self-status token provided.'
        ),
        { status: 401 }
      );
    }

    // Extract patient ID from session token
    let patientId = 'pt_demo_1002';
    if (tokenHeader.includes('pt_token_')) {
      const parts = tokenHeader.split('_');
      if (parts.length >= 3) {
        patientId = parts.slice(2, -1).join('_');
      }
    }

    // Attempt to fetch patient from Cloud Firestore
    const firestorePatient = await getPatientProfileById(patientId);
    const latestRiskPrediction = await getLatestRiskPredictionByPatientId(patientId);
    const medicalHistory = await getMedicalHistoryByPatientId(patientId);

    await logAuditEvent({
      eventType: 'PATIENT_PROFILE_ACCESSED',
      patientId,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    const patientData = firestorePatient || {
      id: patientId,
      mrnHash: '8f9a2e1d0c5b4a39281706f5e4d3c2b1a0f9e8d7c6b5a439281706f5e4d3c2b1',
      dateOfBirth: '1988-06-15',
      gender: 'FEMALE',
      primaryLanguage: 'en',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      createSuccessEnvelope({
        patient: {
          id: patientData.id,
          mrnHash: patientData.mrnHash,
          dateOfBirth: patientData.dateOfBirth,
          gender: patientData.gender,
          primaryLanguage: patientData.primaryLanguage,
          createdAt: patientData.createdAt,
          intakeStatus: 'DEMOGRAPHIC_INTAKE_COMPLETED',
          nextStep: 'AI_SYMPTOM_RISK_PREDICTION',
          latestRiskPrediction: latestRiskPrediction || null,
          medicalHistory: medicalHistory || null,
        },
      })
    );
  } catch {
    return NextResponse.json(
      createErrorEnvelope(
        'PROFILE_RETRIEVAL_ERROR',
        'Unable to retrieve patient profile.'
      ),
      { status: 500 }
    );
  }
}
