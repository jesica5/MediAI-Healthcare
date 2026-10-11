import { GoogleGenAI } from '@google/genai';
import { Language } from '../types';

export interface SymptomAnalysisInput {
  symptoms: string[];
  chiefComplaint: string;
  age?: number;
  gender?: string;
  primaryLanguage?: Language;
  vitals?: {
    heartRate?: number;
    bloodPressure?: string;
    temperatureCelsius?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  medicalHistory?: {
    allergies?: string[];
    chronicConditions?: string[];
    surgeries?: string[];
  };
}

export interface GeminiRiskPredictionOutput {
  acuityLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  riskScore: number; // 0 - 100
  primaryRisks: string[];
  clinicalRationale: string;
  patientFriendlyExplanation: string;
  recommendedTriageCategory: string;
  urgentRedFlags: string[];
  nextSteps: string[];
  aiModel: string;
}

/**
 * Server-Side Gemini API Service for Patient Risk Prediction & Symptom Analysis
 * STRICT SECURITY RULE: Accesses process.env.GEMINI_API_KEY on the server side only.
 */
export async function predictPatientRiskWithGemini(
  input: SymptomAnalysisInput
): Promise<GeminiRiskPredictionOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  const lang = input.primaryLanguage === 'ta' ? 'Tamil' : 'English';

  // Fallback heuristic engine if GEMINI_API_KEY is placeholder or not provided
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === '') {
    return generateFallbackRiskPrediction(input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a senior emergency medicine triage specialist AI system ("MediAI Triage Assistant").
Analyze the following patient clinical presentation and provide an objective clinical acuity assessment and patient-friendly risk explanation in ${lang}.

Patient Demographics & Presentation:
- Age / Gender: ${input.age || 'Unspecified'} years / ${input.gender || 'Unspecified'}
- Chief Complaint: ${input.chiefComplaint}
- Reported Symptoms: ${input.symptoms.join(', ') || 'None specified'}
- Vital Signs:
  * Heart Rate: ${input.vitals?.heartRate ? input.vitals.heartRate + ' bpm' : 'Unrecorded'}
  * Blood Pressure: ${input.vitals?.bloodPressure || 'Unrecorded'}
  * Temperature: ${input.vitals?.temperatureCelsius ? input.vitals.temperatureCelsius + '°C' : 'Unrecorded'}
  * Oxygen Saturation (SpO2): ${input.vitals?.oxygenSaturation ? input.vitals.oxygenSaturation + '%' : 'Unrecorded'}
  * Respiratory Rate: ${input.vitals?.respiratoryRate ? input.vitals.respiratoryRate + '/min' : 'Unrecorded'}
- Pre-existing Chronic Conditions: ${input.medicalHistory?.chronicConditions?.join(', ') || 'None reported'}
- Known Allergies: ${input.medicalHistory?.allergies?.join(', ') || 'None reported'}

INSTRUCTIONS:
Provide a JSON object response strictly conforming to this exact structure (no markdown fences, raw JSON):
{
  "acuityLevel": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
  "riskScore": integer between 0 and 100,
  "primaryRisks": ["Array of top potential risk factors or differential diagnosis considerations"],
  "clinicalRationale": "Detailed technical clinical reasoning for healthcare staff (nurse/doctor)",
  "patientFriendlyExplanation": "Clear, reassuring, easily understood explanation translated for the patient in ${lang}",
  "recommendedTriageCategory": "Emergency Triage Category Recommendation (e.g. Immediate Resuscitation, Emergency, Urgent, Semi-Urgent)",
  "urgentRedFlags": ["Warning signs that require immediate emergency room arrival"],
  "nextSteps": ["Actionable medical next steps"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text) as GeminiRiskPredictionOutput;

    return {
      acuityLevel: parsed.acuityLevel || 'MODERATE',
      riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 50,
      primaryRisks: parsed.primaryRisks || ['Symptom evaluation required'],
      clinicalRationale: parsed.clinicalRationale || 'Evaluated via Gemini AI triage rules.',
      patientFriendlyExplanation: parsed.patientFriendlyExplanation || 'Your symptoms have been reviewed. Please consult a healthcare provider.',
      recommendedTriageCategory: parsed.recommendedTriageCategory || 'Urgent Triage Evaluation',
      urgentRedFlags: parsed.urgentRedFlags || ['Chest pain or difficulty breathing'],
      nextSteps: parsed.nextSteps || ['Proceed to clinical triage desk'],
      aiModel: 'gemini-2.5-flash',
    };
  } catch (err) {
    console.warn('Gemini API call error (switching to safety fallback):', err);
    return generateFallbackRiskPrediction(input);
  }
}

/**
 * Deterministic Safety Fallback Risk Engine
 */
function generateFallbackRiskPrediction(input: SymptomAnalysisInput): GeminiRiskPredictionOutput {
  const symptomsLower = input.symptoms.map((s) => s.toLowerCase()).join(' ') + ' ' + (input.chiefComplaint || '').toLowerCase();
  const spo2 = input.vitals?.oxygenSaturation;
  const isTa = input.primaryLanguage === 'ta';

  let acuityLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  let riskScore = 25;
  let recommendedTriage = isTa ? 'சாதாரண பரிசோதனை (Semi-Urgent)' : 'Standard Routine Assessment (Semi-Urgent)';

  const criticalKeywords = ['chest pain', 'shortness of breath', 'unconscious', 'severe bleeding', 'stroke', 'seizure', 'நெஞ்சு வலி', 'மூச்சுத்திணறல்'];
  const highKeywords = ['high fever', 'severe pain', 'fainting', 'persistent vomiting', 'அதிக காய்ச்சல்', 'கடுமையான வலி'];

  if (criticalKeywords.some((k) => symptomsLower.includes(k)) || (spo2 && spo2 < 90)) {
    acuityLevel = 'CRITICAL';
    riskScore = 92;
    recommendedTriage = isTa ? 'உடனடி அவசர சிகிச்சை (Immediate Emergency)' : 'Immediate Resuscitation / Emergency Care (Level 1)';
  } else if (highKeywords.some((k) => symptomsLower.includes(k)) || (spo2 && spo2 < 94)) {
    acuityLevel = 'HIGH';
    riskScore = 72;
    recommendedTriage = isTa ? 'விரைவு சிகிச்சை (Urgent Triage)' : 'Urgent Clinical Evaluation (Level 2)';
  } else if (input.symptoms.length > 2) {
    acuityLevel = 'MODERATE';
    riskScore = 48;
    recommendedTriage = isTa ? 'மத்திய முன்னுரிமை சிகிச்சை (Moderate Triage)' : 'Moderate Priority Evaluation (Level 3)';
  }

  const clinicalRationale = `Clinical risk score (${riskScore}/100) calculated based on presented symptoms (${input.chiefComplaint}), vital parameters, and emergency triage safety protocol rules.`;

  const patientFriendlyExplanation = isTa
    ? `உங்கள் அறிகுறிகள் (${input.chiefComplaint || 'பதிவு செய்யப்பட்ட அறிகுறிகள்'}) MediAI AI அமைப்பால் ஆய்வு செய்யப்பட்டுள்ளன. உங்களுக்கு ${acuityLevel} முன்னுரிமை ஒதுக்கப்பட்டுள்ளது. தயவுசெய்து செவிலியரிடம் தொடர்பு கொள்ளவும்.`
    : `Your presented symptoms (${input.chiefComplaint || 'reported symptoms'}) have been evaluated by MediAI. An acuity tier of ${acuityLevel} has been assigned for clinical staff review.`;

  return {
    acuityLevel,
    riskScore,
    primaryRisks: input.symptoms.length > 0 ? input.symptoms : ['General Medical Evaluation'],
    clinicalRationale,
    patientFriendlyExplanation,
    recommendedTriageCategory: recommendedTriage,
    urgentRedFlags: [
      isTa ? 'மூச்சுத்திணறல் அல்லது கடுமையான நெஞ்சு வலி இருந்தால் உடனே தெரிவிக்கவும்.' : 'Immediate report required if experiencing severe chest pressure or shortness of breath.',
    ],
    nextSteps: [
      isTa ? 'செவிலியர் அறைக்கு செல்லவும்.' : 'Proceed to triage nurse station for vitals verification.',
    ],
    aiModel: 'medi-ai-fallback-heuristics',
  };
}
