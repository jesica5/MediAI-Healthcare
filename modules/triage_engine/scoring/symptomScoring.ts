/**
 * Symptom Ensemble Scoring Engine
 * Computes S_symptoms in [0, 100] across the 12 clinical physiological symptom vectors.
 */
import { SymptomVector } from '@/modules/patient_intake/types';
import { SymptomScoreResult } from '../types';

export function calculateSymptomEnsembleScore(symptoms: SymptomVector, chiefComplaint?: string): SymptomScoreResult {
  let score = 0;
  const contributingSymptoms: string[] = [];

  // Chief complaint high-risk keyword analysis
  if (chiefComplaint) {
    const ccLower = chiefComplaint.toLowerCase();
    if (ccLower.includes('chest pain') || ccLower.includes('heart') || ccLower.includes('cardiac') || ccLower.includes('நெஞ்சு வலி')) {
      score += 25;
      contributingSymptoms.push('High-acuity cardiac chief complaint');
    } else if (ccLower.includes('breath') || ccLower.includes('dyspnea') || ccLower.includes('suffocat') || ccLower.includes('மூச்சு')) {
      score += 25;
      contributingSymptoms.push('High-acuity respiratory chief complaint');
    } else if (ccLower.includes('bleed') || ccLower.includes('hemorrhage') || ccLower.includes('இரத்தம்')) {
      score += 20;
      contributingSymptoms.push('Hemorrhagic chief complaint');
    } else if (ccLower.includes('unconscious') || ccLower.includes('syncope') || ccLower.includes('faint') || ccLower.includes('மயக்கம்')) {
      score += 20;
      contributingSymptoms.push('Impaired consciousness chief complaint');
    } else if (ccLower.includes('severe pain') || ccLower.includes('agony') || ccLower.includes('கடுமையான வலி')) {
      score += 15;
      contributingSymptoms.push('Severe acute pain chief complaint');
    } else {
      score += 5;
    }
  }

  // 1. Infection / Sepsis symptoms
  if (symptoms.infection_sepsis?.altered_mentation) {
    score += 25;
    contributingSymptoms.push('Altered mentation / acute confusion');
  }
  if (symptoms.infection_sepsis?.rigors) {
    score += 10;
    contributingSymptoms.push('Rigors and severe shaking chills');
  }
  if (symptoms.infection_sepsis?.diaphoresis) {
    score += 8;
    contributingSymptoms.push('Diaphoresis / cold sweats');
  }

  // 2. Respiratory symptoms
  if (symptoms.respiratory?.accessory_muscle_use) {
    score += 20;
    contributingSymptoms.push('Accessory respiratory muscle usage');
  }
  if (symptoms.respiratory?.stridor) {
    score += 30;
    contributingSymptoms.push('Audible stridor / upper airway compromise');
  }
  if (symptoms.respiratory?.cough_character === 'hemoptysis') {
    score += 20;
    contributingSymptoms.push('Hemoptysis (coughing blood)');
  } else if (symptoms.respiratory?.cough_character === 'productive') {
    score += 8;
    contributingSymptoms.push('Productive cough');
  }

  // 3. Cardiac symptoms
  if (symptoms.cardiac?.chest_pain_character && symptoms.cardiac.chest_pain_character !== 'none') {
    score += 15;
    contributingSymptoms.push(`Chest pain (${symptoms.cardiac.chest_pain_character})`);
  }
  if (symptoms.cardiac?.radiation && symptoms.cardiac.radiation !== 'none') {
    score += 15;
    contributingSymptoms.push(`Chest pain radiation to ${symptoms.cardiac.radiation}`);
  }
  if (symptoms.cardiac?.palpitations) {
    score += 10;
    contributingSymptoms.push('Acute palpitations');
  }

  // 4. Neurological symptoms
  if (symptoms.neurological?.fast_facial_droop || symptoms.neurological?.fast_arm_drift || symptoms.neurological?.fast_speech_difficulty) {
    score += 35;
    contributingSymptoms.push('Acute focal neurological deficit (FAST positive)');
  }
  if (symptoms.neurological?.seizures) {
    score += 30;
    contributingSymptoms.push('Seizure activity');
  }
  if (symptoms.neurological?.pupil_response && symptoms.neurological.pupil_response !== 'normal') {
    score += 20;
    contributingSymptoms.push(`Abnormal pupil response: ${symptoms.neurological.pupil_response}`);
  }

  // 5. Blood Pressure symptoms
  if (symptoms.blood_pressure?.severe_headache) {
    score += 12;
    contributingSymptoms.push('Severe acute hypertensive headache');
  }

  // 6. Diabetes symptoms
  if (symptoms.diabetes?.kussmaul_breathing || symptoms.diabetes?.fruity_breath) {
    score += 25;
    contributingSymptoms.push('Ketotic / Kussmaul respirations');
  }

  // 7. Gastrointestinal symptoms
  if (symptoms.gastrointestinal?.emesis === 'hematemesis') {
    score += 30;
    contributingSymptoms.push('Hematemesis (blood emesis)');
  }
  if (symptoms.gastrointestinal?.rebound_tenderness) {
    score += 25;
    contributingSymptoms.push('Peritoneal rebound tenderness');
  }
  if (symptoms.gastrointestinal?.stool_color === 'melena') {
    score += 20;
    contributingSymptoms.push('Melena (dark gastrointestinal bleed)');
  }

  // 8. Injury & Trauma symptoms
  if (symptoms.injury_trauma?.bleeding_rate === 'pulsatile') {
    score += 35;
    contributingSymptoms.push('Pulsatile active arterial hemorrhage');
  } else if (symptoms.injury_trauma?.bleeding_rate === 'rapid') {
    score += 20;
    contributingSymptoms.push('Rapid active bleeding');
  }
  if (symptoms.injury_trauma?.deformity) {
    score += 15;
    contributingSymptoms.push('Anatomical bone/joint deformity');
  }

  // 9. Pregnancy symptoms
  if (symptoms.pregnancy?.vaginal_bleeding) {
    score += 25;
    contributingSymptoms.push('Vaginal bleeding during pregnancy');
  }
  if (symptoms.pregnancy?.severe_headache) {
    score += 15;
    contributingSymptoms.push('Severe pre-eclamptic headache');
  }

  // 10. Allergic symptoms
  if (symptoms.allergic?.mucosal_swelling) {
    score += 25;
    contributingSymptoms.push('Mucosal / airway angioedema');
  }
  if (symptoms.allergic?.wheeze) {
    score += 15;
    contributingSymptoms.push('Acute bronchospastic wheeze');
  }
  if (symptoms.allergic?.urticaria) {
    score += 10;
    contributingSymptoms.push('Acute systemic urticaria');
  }

  // 11. Dehydration symptoms
  if (symptoms.dehydration?.urine_output === 'none') {
    score += 25;
    contributingSymptoms.push('Complete anuria / lack of urination');
  }
  if (symptoms.dehydration?.skin_turgor === 'tented') {
    score += 20;
    contributingSymptoms.push('Tented skin turgor');
  }

  // 12. Toxic exposure symptoms
  if (symptoms.toxic_exposure?.salivation === 'excessive') {
    score += 20;
    contributingSymptoms.push('Excessive salivation toxidrome');
  }
  if (symptoms.toxic_exposure?.puncture_marks) {
    score += 20;
    contributingSymptoms.push('Puncture / venomous bite mark');
  }

  const normalizedScore = Math.min(100, Math.max(0, score));

  return {
    score: normalizedScore,
    contributingSymptoms,
  };
}
