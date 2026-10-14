import { z } from 'zod';
import { medicalHistorySchema } from './medicalHistory.schema';

export const infectionSepsisSchema = z
  .object({
    altered_mentation: z.boolean().optional(),
    rigors: z.boolean().optional(),
    diaphoresis: z.boolean().optional(),
    fever: z.boolean().optional(),
    hypothermia: z.boolean().optional(),
    fatigue_malaise: z.boolean().optional(),
    cellulitis_wound_infection: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const respiratorySchema = z
  .object({
    cough_character: z.enum(['none', 'dry', 'productive', 'hemoptysis']).optional(),
    accessory_muscle_use: z.boolean().optional(),
    stridor: z.boolean().optional(),
    shortness_of_breath: z.boolean().optional(),
    wheeze: z.boolean().optional(),
    chest_tightness: z.boolean().optional(),
    cyanosis: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const cardiacSchema = z
  .object({
    chest_pain_character: z
      .enum(['none', 'pressure', 'sharp', 'tearing', 'burning', 'other'])
      .optional(),
    radiation: z
      .enum(['none', 'left_arm', 'jaw', 'back', 'both_arms', 'other'])
      .optional(),
    diaphoresis: z.boolean().optional(),
    palpitations: z.boolean().optional(),
    chest_pain: z.boolean().optional(),
    syncope: z.boolean().optional(),
    pedal_edema: z.boolean().optional(),
    orthopnea: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const neurologicalSchema = z
  .object({
    fast_facial_droop: z.boolean().optional(),
    fast_arm_drift: z.boolean().optional(),
    fast_speech_difficulty: z.boolean().optional(),
    gcs_score: z.number().int().min(3).max(15).nullable().optional(),
    pupil_response: z.enum(['normal', 'sluggish', 'unresponsive', 'asymmetric']).optional(),
    seizures: z.boolean().optional(),
    dizziness_fainting: z.boolean().optional(),
    severe_thunderclap_headache: z.boolean().optional(),
    numbness_weakness: z.boolean().optional(),
    confusion_delirium: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const bloodPressureSchema = z
  .object({
    severe_headache: z.boolean().optional(),
    chest_pain: z.boolean().optional(),
    blurred_vision: z.boolean().optional(),
    epistaxis: z.boolean().optional(),
    dizziness_standing: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const diabetesSchema = z
  .object({
    kussmaul_breathing: z.boolean().optional(),
    fruity_breath: z.boolean().optional(),
    polydipsia_polyuria: z.boolean().optional(),
    hypoglycemia_symptoms: z.boolean().optional(),
    extreme_fatigue: z.boolean().optional(),
    nausea_vomiting_dka: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const gastrointestinalSchema = z
  .object({
    pain_quadrant: z
      .enum(['none', 'RUQ', 'LUQ', 'RLQ', 'LLQ', 'epigastric', 'periumbilical', 'diffuse'])
      .optional(),
    rebound_tenderness: z.boolean().optional(),
    emesis: z.enum(['none', 'clear', 'bilious', 'coffee_ground', 'hematemesis']).optional(),
    stool_color: z.enum(['normal', 'melena', 'hematochezia', 'clay_colored']).optional(),
    severe_abdominal_pain: z.boolean().optional(),
    nausea_vomiting: z.boolean().optional(),
    hematemesis: z.boolean().optional(),
    rectal_bleeding_melena: z.boolean().optional(),
    severe_diarrhea: z.boolean().optional(),
    abdominal_distension: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const injuryTraumaSchema = z
  .object({
    mechanism: z
      .enum(['none', 'blunt', 'penetrating', 'fall', 'mva', 'burn', 'other'])
      .optional(),
    bleeding_rate: z.enum(['none', 'controlled', 'rapid', 'pulsatile']).optional(),
    deformity: z.boolean().optional(),
    airway_patency: z.enum(['patent', 'threatened', 'obstructed']).optional(),
    blunt_head_trauma: z.boolean().optional(),
    active_bleeding: z.boolean().optional(),
    fracture_dislocation: z.boolean().optional(),
    burn_injury: z.boolean().optional(),
    spinal_tenderness: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const pregnancySchema = z
  .object({
    gestational_age_weeks: z.number().int().min(1).max(45).nullable().optional(),
    pelvic_pain: z.boolean().optional(),
    vaginal_bleeding: z.boolean().optional(),
    severe_headache: z.boolean().optional(),
    fluid_leakage: z.boolean().optional(),
    reduced_fetal_movement: z.boolean().optional(),
    facial_edema: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const allergicSchema = z
  .object({
    urticaria: z.boolean().optional(),
    mucosal_swelling: z.boolean().optional(),
    voice_change: z.boolean().optional(),
    wheeze: z.boolean().optional(),
    throat_tightness: z.boolean().optional(),
    facial_swelling: z.boolean().optional(),
    generalized_pruritus: z.boolean().optional(),
    anaphylaxis_history: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const dehydrationSchema = z
  .object({
    skin_turgor: z.enum(['normal', 'reduced', 'tented']).optional(),
    mucous_membranes: z.enum(['moist', 'dry', 'very_dry']).optional(),
    urine_output: z.enum(['normal', 'reduced', 'none']).optional(),
    capillary_refill_seconds: z.number().min(0).max(15).nullable().optional(),
    extreme_thirst: z.boolean().optional(),
    sunken_eyes: z.boolean().optional(),
    anuria_oliguria: z.boolean().optional(),
    postural_dizziness: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

export const toxicExposureSchema = z
  .object({
    substance_ingested: z.string().max(200).nullable().optional(),
    puncture_marks: z.boolean().optional(),
    salivation: z.enum(['normal', 'excessive', 'dry']).optional(),
    pupil_size: z.enum(['normal', 'pinpoint', 'dilated']).optional(),
    snake_animal_bite: z.boolean().optional(),
    chemical_poisoning: z.boolean().optional(),
    smoke_inhalation: z.boolean().optional(),
    loss_of_consciousness_toxin: z.boolean().optional(),
    hypersalivation_lacrimation: z.boolean().optional(),
    other: z.boolean().optional(),
  })
  .strict();

/**
 * 12-domain symptom vector
 */
export const symptomVectorSchema = z
  .object({
    infection_sepsis: infectionSepsisSchema.optional(),
    respiratory: respiratorySchema.optional(),
    cardiac: cardiacSchema.optional(),
    neurological: neurologicalSchema.optional(),
    blood_pressure: bloodPressureSchema.optional(),
    diabetes: diabetesSchema.optional(),
    gastrointestinal: gastrointestinalSchema.optional(),
    injury_trauma: injuryTraumaSchema.optional(),
    pregnancy: pregnancySchema.optional(),
    allergic: allergicSchema.optional(),
    dehydration: dehydrationSchema.optional(),
    toxic_exposure: toxicExposureSchema.optional(),
    // Provisionally carry medical history inside symptom_vector TODO(contract)
    medical_history: medicalHistorySchema.optional(),
  })
  .strict();

export type SymptomVectorValidated = z.infer<typeof symptomVectorSchema>;
