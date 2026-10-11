import { NextRequest, NextResponse } from 'next/server';
import { createSuccessEnvelope, createErrorEnvelope } from '@/shared/utils/envelope';
import { predictPatientRiskWithGemini } from '@/shared/services/geminiService';
import { saveRiskPrediction, saveAssessment } from '@/shared/services/firestoreService';
import { logAuditEvent } from '@/shared/utils/auditLogger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patientId = 'pt_demo_1002',
      symptoms = [],
      chiefComplaint = '',
      vitals,
      medicalHistory,
      primaryLanguage = 'en',
      age,
      gender,
    } = body || {};

    if (!chiefComplaint && symptoms.length === 0) {
      return NextResponse.json(
        createErrorEnvelope(
          'MISSING_INPUT',
          'Please provide symptoms or chief complaint for AI risk assessment.',
          [{ field: 'chiefComplaint', issue: 'Chief complaint or symptoms required.' }]
        ),
        { status: 400 }
      );
    }

    // 1. Save Assessment snapshot to Firestore (`assessments` collection)
    const assessmentRecord = await saveAssessment({
      patientId,
      chiefComplaint,
      symptoms,
      vitalSigns: vitals,
    });

    // 2. Execute AI Risk Prediction with Gemini API (Server-Side)
    const aiPrediction = await predictPatientRiskWithGemini({
      symptoms,
      chiefComplaint,
      vitals,
      medicalHistory,
      primaryLanguage,
      age,
      gender,
    });

    // 3. Save Risk Prediction snapshot to Firestore (`risk_predictions` collection)
    const savedPrediction = await saveRiskPrediction({
      patientId,
      assessmentId: assessmentRecord.id,
      acuityLevel: aiPrediction.acuityLevel,
      riskScore: aiPrediction.riskScore,
      primaryRisks: aiPrediction.primaryRisks,
      clinicalRationale: aiPrediction.clinicalRationale,
      patientFriendlyExplanation: aiPrediction.patientFriendlyExplanation,
      recommendedTriageCategory: aiPrediction.recommendedTriageCategory,
      urgentRedFlags: aiPrediction.urgentRedFlags,
      aiModel: aiPrediction.aiModel,
    });

    // 4. Log Audit Event (Zero PHI in log payload)
    await logAuditEvent({
      eventType: 'AI_RISK_PREDICTION_GENERATED',
      patientId,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
      payload: {
        acuityLevel: aiPrediction.acuityLevel,
        riskScore: aiPrediction.riskScore,
        aiModel: aiPrediction.aiModel,
      },
    });

    return NextResponse.json(
      createSuccessEnvelope({
        prediction: savedPrediction,
        assessment: assessmentRecord,
      })
    );
  } catch (err) {
    console.error('AI Risk Prediction error:', err);
    return NextResponse.json(
      createErrorEnvelope(
        'AI_PREDICTION_ERROR',
        'An error occurred while generating AI patient risk prediction.'
      ),
      { status: 500 }
    );
  }
}
