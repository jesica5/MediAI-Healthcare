/**
 * Deterministic Clinical Red-Flag Safety Engine
 * Evaluates the 12 clinical physiological risk categories defined in the MediAI Master Specification (Section 5).
 * 
 * Safety Rule: A positive match on ANY Tier-1 Red Flag immediately forces a hardcoded triage acuity
 * of Critical (Priority 1, score >= 85) and bypasses probabilistic machine-learning models.
 */
import { VitalsInput, SymptomVector, MedicalHistory } from '@/modules/patient_intake/types';
import { RedFlagEvaluationResult } from '../types';

export function evaluateClinicalRedFlags(
  vitals: Partial<VitalsInput>,
  symptoms: SymptomVector,
  history?: Partial<MedicalHistory>
): RedFlagEvaluationResult {
  const triggeredFlags: string[] = [];
  const triggeredDomains: number[] = [];
  let domainNumber: number | null = null;
  let domainName: string | null = null;
  let clinicalFocus: string | null = null;
  let reason: string | null = null;

  const recordFlag = (num: number, name: string, focus: string, flag: string) => {
    triggeredFlags.push(flag);
    if (!triggeredDomains.includes(num)) {
      triggeredDomains.push(num);
    }
    if (!reason) {
      domainNumber = num;
      domainName = name;
      clinicalFocus = focus;
      reason = flag;
    }
  };

  const hr = vitals.heart_rate ?? null;
  const rr = vitals.respiratory_rate ?? null;
  const sbp = vitals.systolic_bp ?? null;
  const dbp = vitals.diastolic_bp ?? null;
  const spo2 = vitals.oxygen_saturation ?? null;
  const temp = vitals.temperature_celsius ?? null;
  const cbg = vitals.capillary_blood_glucose ?? null;

  // ------------------------------------------------------------------------
  // Domain 1: General Infections & Sepsis
  // ------------------------------------------------------------------------
  let qsofaScore = 0;
  if (rr !== null && rr >= 22) qsofaScore++;
  if (sbp !== null && sbp <= 100) qsofaScore++;
  if (symptoms.infection_sepsis?.altered_mentation) qsofaScore++;

  if (qsofaScore >= 2) {
    const flag = `Tier-1 Red Flag [Domain 1 - Sepsis]: qSOFA score >= 2 (RR: ${rr ?? 'N/A'}, SBP: ${sbp ?? 'N/A'}, altered mentation: ${!!symptoms.infection_sepsis?.altered_mentation}). High septic shock risk.`;
    recordFlag(1, 'General Infections & Sepsis', 'Septic shock, systemic inflammatory response syndrome (SIRS)', flag);
  }

  if (temp !== null && temp < 35.0) {
    const flag = `Tier-1 Red Flag [Domain 1 - Sepsis]: Core hypothermia (${temp}°C < 35.0°C). Severe sepsis / systemic collapse warning.`;
    recordFlag(1, 'General Infections & Sepsis', 'Severe hypothermic sepsis, metabolic decompensation', flag);
  }

  // ------------------------------------------------------------------------
  // Domain 2: Respiratory Warning Signs
  // ------------------------------------------------------------------------
  if (spo2 !== null && spo2 < 90.0) {
    const flag = `Tier-1 Red Flag [Domain 2 - Respiratory]: Severe hypoxemia (SpO2 ${spo2}% < 90% on room air).`;
    recordFlag(2, 'Respiratory Warning Signs', 'Acute respiratory distress, severe asthma, impending respiratory failure', flag);
  }

  if (rr !== null && (rr > 32 || rr < 8)) {
    const flag = `Tier-1 Red Flag [Domain 2 - Respiratory]: Extreme respiratory rate (${rr} bpm; critical threshold: < 8 or > 32 bpm).`;
    recordFlag(2, 'Respiratory Warning Signs', 'Impending respiratory arrest or acute severe distress', flag);
  }

  if (symptoms.respiratory?.stridor) {
    const flag = `Tier-1 Red Flag [Domain 2 - Respiratory]: Audible upper airway stridor. Critical acute upper airway compromise.`;
    recordFlag(2, 'Respiratory Warning Signs', 'Upper airway obstruction, acute laryngeal edema', flag);
  }

  // ------------------------------------------------------------------------
  // Domain 3: Cardiac Warning Signs
  // ------------------------------------------------------------------------
  const cardiac = symptoms.cardiac;
  const isCrushingChestPain =
    cardiac?.chest_pain_character === 'pressure' ||
    cardiac?.chest_pain_character === 'tearing' ||
    cardiac?.chest_pain_character === 'sharp';
  const hasHighRiskRadiation =
    cardiac?.radiation === 'left_arm' ||
    cardiac?.radiation === 'jaw' ||
    cardiac?.radiation === 'both_arms';

  if (isCrushingChestPain && hasHighRiskRadiation) {
    const flag = `Tier-1 Red Flag [Domain 3 - Cardiac]: Crushing retrosternal chest pain radiating to ${cardiac?.radiation}. Suspected Acute Coronary Syndrome (ACS).`;
    recordFlag(3, 'Cardiac Warning Signs', 'Acute Coronary Syndrome (ACS), acute myocardial infarction', flag);
  }

  if (hr !== null && (hr > 150 || hr < 40)) {
    const flag = `Tier-1 Red Flag [Domain 3 - Cardiac]: Extreme heart rate (${hr} bpm; critical threshold: < 40 or > 150 bpm). Malignant arrhythmia risk.`;
    recordFlag(3, 'Cardiac Warning Signs', 'Malignant ventricular arrhythmia, hemodynamic collapse', flag);
  }

  // ------------------------------------------------------------------------
  // Domain 4: Neurological Warning Signs
  // ------------------------------------------------------------------------
  const neuro = symptoms.neurological;
  const hasFastDeficit =
    neuro?.fast_facial_droop ||
    neuro?.fast_arm_drift ||
    neuro?.fast_speech_difficulty;

  if (hasFastDeficit) {
    const flag = `Tier-1 Red Flag [Domain 4 - Neurological]: Acute focal neurological deficit (FAST criteria positive). Acute ischemic stroke alert.`;
    recordFlag(4, 'Neurological Warning Signs', 'Acute ischemic stroke, intracranial hemorrhage', flag);
  }

  if (neuro?.gcs_score !== null && neuro?.gcs_score !== undefined && neuro.gcs_score < 12) {
    const flag = `Tier-1 Red Flag [Domain 4 - Neurological]: Depressed consciousness (GCS score ${neuro.gcs_score} < 12).`;
    recordFlag(4, 'Neurological Warning Signs', 'Severe central nervous system depression, acute intracranial catastrophe', flag);
  }

  if (neuro?.seizures) {
    const flag = `Tier-1 Red Flag [Domain 4 - Neurological]: Active or recurrent seizures / suspected status epilepticus.`;
    recordFlag(4, 'Neurological Warning Signs', 'Status epilepticus, acute central neurological seizure', flag);
  }

  // ------------------------------------------------------------------------
  // Domain 5: Blood Pressure Abnormalities
  // ------------------------------------------------------------------------
  const bpSymptoms = symptoms.blood_pressure;
  const hasBpCrisisSymptoms = bpSymptoms?.severe_headache || bpSymptoms?.chest_pain;

  if ((sbp !== null && sbp > 180) || (dbp !== null && dbp > 120)) {
    if (hasBpCrisisSymptoms) {
      const flag = `Tier-1 Red Flag [Domain 5 - Blood Pressure]: Hypertensive crisis (SBP: ${sbp ?? 'N/A'}, DBP: ${dbp ?? 'N/A'} mmHg with acute end-organ symptoms).`;
      recordFlag(5, 'Blood Pressure Abnormalities', 'Malignant hypertension, acute hypertensive encephalopathy', flag);
    }
  }

  if (sbp !== null && sbp < 85) {
    const flag = `Tier-1 Red Flag [Domain 5 - Blood Pressure]: Profound hypotension and shock (SBP ${sbp} mmHg < 85 mmHg).`;
    recordFlag(5, 'Blood Pressure Abnormalities', 'Profound circulatory shock, hypovolemic / distributive collapse', flag);
  }

  // ------------------------------------------------------------------------
  // Domain 6: Diabetes-Related Risks
  // ------------------------------------------------------------------------
  const diabetes = symptoms.diabetes;
  const hasKetoticBreathing = diabetes?.kussmaul_breathing || diabetes?.fruity_breath;

  if (cbg !== null && cbg < 60 && (symptoms.infection_sepsis?.altered_mentation || (neuro?.gcs_score && neuro.gcs_score < 15))) {
    const flag = `Tier-1 Red Flag [Domain 6 - Diabetes]: Severe hypoglycemia (CBG ${cbg} mg/dL < 60 mg/dL with altered mentation). Impending hypoglycemic coma.`;
    recordFlag(6, 'Diabetes-Related Risks', 'Severe hypoglycemic coma, acute neuroglycopenia', flag);
  }

  if (cbg !== null && cbg > 400 && hasKetoticBreathing) {
    const flag = `Tier-1 Red Flag [Domain 6 - Diabetes]: Extreme hyperglycemia (CBG ${cbg} mg/dL > 400 mg/dL with ketotic/Kussmaul breathing). Severe DKA / HHS crisis.`;
    recordFlag(6, 'Diabetes-Related Risks', 'Diabetic Ketoacidosis (DKA), Hyperosmolar Hyperglycemic State (HHS)', flag);
  }

  // ------------------------------------------------------------------------
  // Domain 7: Gastrointestinal Issues
  // ------------------------------------------------------------------------
  const gi = symptoms.gastrointestinal;

  if (gi?.emesis === 'hematemesis') {
    const flag = `Tier-1 Red Flag [Domain 7 - Gastrointestinal]: Massive hematemesis (vomiting blood). Active severe upper GI hemorrhage.`;
    recordFlag(7, 'Gastrointestinal Issues', 'Active variceal or peptic upper GI hemorrhage', flag);
  }

  if (gi?.rebound_tenderness) {
    const flag = `Tier-1 Red Flag [Domain 7 - Gastrointestinal]: Rebound tenderness / acute peritoneal involuntary rigidity. Perforated viscus alert.`;
    recordFlag(7, 'Gastrointestinal Issues', 'Perforated hollow viscus, acute peritonitis, acute surgical abdomen', flag);
  }

  if (gi?.stool_color === 'melena' && ((sbp !== null && sbp < 90) || (hr !== null && hr > 110))) {
    const flag = `Tier-1 Red Flag [Domain 7 - Gastrointestinal]: Melena with hemodynamic compromise (SBP: ${sbp}, HR: ${hr}). Exsanguinating GI bleed.`;
    recordFlag(7, 'Gastrointestinal Issues', 'Exsanguinating gastrointestinal hemorrhage with shock', flag);
  }

  // ------------------------------------------------------------------------
  // Domain 8: Injury & Trauma
  // ------------------------------------------------------------------------
  const trauma = symptoms.injury_trauma;

  if (trauma?.bleeding_rate === 'pulsatile') {
    const flag = `Tier-1 Red Flag [Domain 8 - Injury & Trauma]: Pulsatile arterial hemorrhage. Immediate life-threatening blood loss.`;
    recordFlag(8, 'Injury & Trauma', 'Exsanguinating arterial hemorrhage, rapid hemorrhagic shock', flag);
  }

  if (trauma?.airway_patency === 'obstructed') {
    const flag = `Tier-1 Red Flag [Domain 8 - Injury & Trauma]: Obstructed airway. Total ventilatory emergency.`;
    recordFlag(8, 'Injury & Trauma', 'Acute airway obstruction, immediate asphyxiation threat', flag);
  }

  // ------------------------------------------------------------------------
  // Domain 9: Pregnancy-Related Risks
  // ------------------------------------------------------------------------
  const preg = symptoms.pregnancy;
  const isPregnant = (history?.pregnancy_status === 'pregnant') || (preg?.gestational_age_weeks !== undefined && preg?.gestational_age_weeks !== null);
  const gestWeeks = preg?.gestational_age_weeks ?? 0;

  if (isPregnant) {
    if (gestWeeks >= 20 && preg?.vaginal_bleeding) {
      const flag = `Tier-1 Red Flag [Domain 9 - Pregnancy]: Vaginal hemorrhage in pregnancy (${gestWeeks} weeks). Suspected placental abruption.`;
      recordFlag(9, 'Pregnancy-Related Risks', 'Placental abruption, maternal-fetal exsanguination', flag);
    }

    if (gestWeeks >= 20 && (preg?.severe_headache || (sbp !== null && sbp >= 160)) && preg?.pelvic_pain) {
      const flag = `Tier-1 Red Flag [Domain 9 - Pregnancy]: Severe hypertension/headache with pelvic/epigastric pain in pregnancy (${gestWeeks} weeks). Impending eclampsia.`;
      recordFlag(9, 'Pregnancy-Related Risks', 'Severe pre-eclampsia, impending eclamptic seizures', flag);
    }
  }

  // ------------------------------------------------------------------------
  // Domain 10: Allergic Reactions
  // ------------------------------------------------------------------------
  const allergic = symptoms.allergic;

  if (allergic?.mucosal_swelling && (allergic?.voice_change || symptoms.respiratory?.stridor)) {
    const flag = `Tier-1 Red Flag [Domain 10 - Allergic]: Angioedema of tongue/pharynx with acute airway compromise. Anaphylactic airway closure.`;
    recordFlag(10, 'Allergic Reactions', 'Severe anaphylaxis, rapid fatal airway closure', flag);
  }

  if (allergic?.wheeze && sbp !== null && sbp < 90) {
    const flag = `Tier-1 Red Flag [Domain 10 - Allergic]: Severe acute bronchospasm with systemic hypotension (SBP ${sbp} mmHg). Anaphylactic shock.`;
    recordFlag(10, 'Allergic Reactions', 'Anaphylactic circulatory shock', flag);
  }

  // ------------------------------------------------------------------------
  // Domain 11: Dehydration & Fluid Balance
  // ------------------------------------------------------------------------
  const dehy = symptoms.dehydration;

  if (dehy?.urine_output === 'none') {
    const flag = `Tier-1 Red Flag [Domain 11 - Dehydration]: Anuria > 12 hours. Severe hypovolemia, pre-renal acute renal failure.`;
    recordFlag(11, 'Dehydration & Fluid Balance', 'Severe hypovolemia, pre-renal acute renal failure', flag);
  }

  if (dehy?.skin_turgor === 'tented' && dehy?.capillary_refill_seconds !== null && dehy?.capillary_refill_seconds !== undefined && dehy.capillary_refill_seconds > 4) {
    const flag = `Tier-1 Red Flag [Domain 11 - Dehydration]: Tented skin turgor with severe capillary refill delay (${dehy.capillary_refill_seconds}s > 4s). Profound hypovolemic dehydration.`;
    recordFlag(11, 'Dehydration & Fluid Balance', 'Profound hypovolemic shock, circulatory collapse', flag);
  }

  // ------------------------------------------------------------------------
  // Domain 12: Multi-System / Toxic Exposure
  // ------------------------------------------------------------------------
  const toxic = symptoms.toxic_exposure;

  if (toxic?.salivation === 'excessive' && toxic?.pupil_size === 'pinpoint') {
    const flag = `Tier-1 Red Flag [Domain 12 - Toxic Exposure]: Classic SLUDGE toxidrome signs (excessive salivation, pinpoint pupils). Organophosphate poisoning crisis.`;
    recordFlag(12, 'Multi-System / Toxic Exposure', 'Acute cholinergic / organophosphate poisoning toxicity', flag);
  }

  if (toxic?.puncture_marks && (neuro?.fast_facial_droop || symptoms.respiratory?.accessory_muscle_use)) {
    const flag = `Tier-1 Red Flag [Domain 12 - Toxic Exposure]: Puncture bite with descending neurotoxicity / respiratory muscle weakness. Neurotoxic envenomation.`;
    recordFlag(12, 'Multi-System / Toxic Exposure', 'Neurotoxic envenomation, impending respiratory paralysis', flag);
  }

  return {
    hasRedFlag: triggeredFlags.length > 0,
    domainNumber,
    domainName,
    clinicalFocus,
    reason,
    triggeredFlags,
    triggeredDomains,
  };
}
