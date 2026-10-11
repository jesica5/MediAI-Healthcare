/**
 * Server-side Gemini AI Service
 * Strictly server-only: Never import or call from client components.
 */
import { GoogleGenAI } from '@google/genai';
import { VitalsInput, SymptomVector, Language } from '../types';

export interface GeminiRiskExplanation {
  summary: string;
  identifiedConcerns: string[];
  riskExplanation: string;
  clinicalQuestionsForDoctor: string[];
  disclaimer: string;
}

/**
 * Server-only guard: prevents execution in client/browser context
 */
function assertServerOnly() {
  if (typeof window !== 'undefined') {
    throw new Error('Gemini service is server-only and cannot be executed in the browser.');
  }
}

/**
 * Generates an AI-assisted explanation of symptoms and vitals for clinician review.
 * NOTE: This is strictly decision-support explanation and NEVER diagnoses, prescribes, or classifies acuity.
 */
export async function generateGeminiRiskExplanation(params: {
  chiefComplaint: string;
  symptoms: SymptomVector;
  vitals: VitalsInput;
  missingEssentialVitals: string[];
  language: Language;
}): Promise<GeminiRiskExplanation> {
  assertServerOnly();

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === '') {
    // Graceful fallback for mock/dev environment
    return {
      summary: `Patient reported: "${params.chiefComplaint}" with missing essential vitals: ${params.missingEssentialVitals.join(', ') || 'none'}.`,
      identifiedConcerns: [
        params.chiefComplaint,
        ...(params.missingEssentialVitals.length > 0
          ? [`Unmeasured essential vitals: ${params.missingEssentialVitals.join(', ')}`]
          : []),
      ],
      riskExplanation:
        'AI assessment explanation placeholder (GEMINI_API_KEY not configured). Decision-support only.',
      clinicalQuestionsForDoctor: [
        'Confirm duration and progression of chief complaint',
        'Verify vital signs manually',
      ],
      disclaimer: 'Decision-support prototype. Not a diagnosis. Clinical judgment required.',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an AI decision-support assistant in emergency triage software (MediAI).
You do NOT diagnose, prescribe, calculate dosages, or classify triage acuity.
Analyze the following patient intake data and provide a neutral, objective clinical explanation for the attending doctor.

Patient Data:
- Chief Complaint: "${params.chiefComplaint}"
- Language: "${params.language}"
- Vitals: ${JSON.stringify(params.vitals)}
- Missing Essential Vitals: ${JSON.stringify(params.missingEssentialVitals)}
- Reported Symptoms: ${JSON.stringify(params.symptoms)}

Respond in valid JSON format ONLY with the following schema:
{
  "summary": "Objective 1-sentence clinical summary of reported symptoms",
  "identifiedConcerns": ["Key symptom or vital sign concern 1", "Concern 2"],
  "riskExplanation": "Objective explanation of why these symptoms warrant clinical attention without diagnosing a disease",
  "clinicalQuestionsForDoctor": ["Suggested targeted assessment question 1", "Question 2"],
  "disclaimer": "Decision-support prototype. Not a diagnosis. Clinical judgment required."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';

    // Clean JSON response
    const cleanedJson = responseText
      .replace(/^```json\s*/, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed = JSON.parse(cleanedJson) as GeminiRiskExplanation;
    return {
      ...parsed,
      disclaimer: 'Decision-support prototype. Not a diagnosis. Clinical judgment required.',
    };
  } catch (err: unknown) {
    // If external API call fails, return structured graceful fallback
    return {
      summary: `Patient reported: "${params.chiefComplaint}".`,
      identifiedConcerns: [params.chiefComplaint],
      riskExplanation:
        'Gemini analysis temporarily unavailable. Proceeding with standard intake presentation.',
      clinicalQuestionsForDoctor: ['Examine patient according to primary complaint'],
      disclaimer: 'Decision-support prototype. Not a diagnosis. Clinical judgment required.',
    };
  }
}
