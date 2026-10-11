export interface VitalThresholds {
  normalMin: number;
  normalMax: number;
  warningLowMin?: number;
  warningLowMax?: number;
  warningHighMin?: number;
  warningHighMax?: number;
  criticalLowThreshold?: number;
  criticalHighThreshold?: number;
  unit: string;
}

export const VITAL_SAFETY_BASELINES: Record<string, VitalThresholds> = {
  heart_rate: {
    normalMin: 50,
    normalMax: 100,
    warningLowMin: 40,
    warningLowMax: 49,
    warningHighMin: 110,
    warningHighMax: 149,
    criticalLowThreshold: 40,
    criticalHighThreshold: 150,
    unit: 'bpm',
  },
  respiratory_rate: {
    normalMin: 12,
    normalMax: 20,
    warningHighMin: 22,
    warningHighMax: 32,
    criticalLowThreshold: 8,
    criticalHighThreshold: 32,
    unit: 'bpm',
  },
  systolic_bp: {
    normalMin: 90,
    normalMax: 120,
    warningLowMin: 85,
    warningLowMax: 89,
    warningHighMin: 140,
    warningHighMax: 179,
    criticalLowThreshold: 85,
    criticalHighThreshold: 180,
    unit: 'mmHg',
  },
  diastolic_bp: {
    normalMin: 60,
    normalMax: 80,
    warningHighMin: 90,
    warningHighMax: 119,
    criticalHighThreshold: 120,
    unit: 'mmHg',
  },
  oxygen_saturation: {
    normalMin: 95,
    normalMax: 100,
    warningLowMin: 90,
    warningLowMax: 93,
    criticalLowThreshold: 90,
    unit: '%',
  },
  temperature_celsius: {
    normalMin: 36.5,
    normalMax: 37.5,
    warningLowMin: 35.0,
    warningLowMax: 35.9,
    warningHighMin: 38.3,
    warningHighMax: 39.9,
    criticalLowThreshold: 35.0,
    criticalHighThreshold: 40.0,
    unit: '°C',
  },
  capillary_blood_glucose: {
    normalMin: 70,
    normalMax: 140,
    warningLowMin: 60,
    warningLowMax: 69,
    warningHighMin: 200,
    warningHighMax: 399,
    criticalLowThreshold: 60,
    criticalHighThreshold: 400,
    unit: 'mg/dL',
  },
};

export const CLINICAL_RED_FLAG_DOMAINS = [
  'General Infections & Sepsis (qSOFA >= 2, hypothermia <35°C)',
  'Respiratory Warning Signs (SpO2 < 90%, cyanosis, stridor, RR >32 or <8)',
  'Cardiac Warning Signs (Crushing retrosternal pain, syncope, HR >150 or <40)',
  'Neurological Warning Signs (FAST deficit, GCS <12, status epilepticus)',
  'Blood Pressure Abnormalities (Hypertensive crisis SBP >180, shock SBP <85)',
  'Diabetes-Related Risks (Severe hypoglycemia CBG <60, CBG >400 with ketotic breathing)',
  'Gastrointestinal Issues (Massive hematemesis, involuntary guarding, melena with instability)',
  'Injury & Trauma (Pulsatile hemorrhage, flail chest, spinal cord injury)',
  'Pregnancy-Related Risks (Third-trimester hemorrhage, severe epigastric pain with aura)',
  'Allergic Reactions (Angioedema of tongue/pharynx, stridor with hypotension)',
  'Dehydration & Fluid Balance (Anuria >12h, severe tenting, cap refill >4s)',
  'Multi-System / Toxic Exposure (Organophosphate SLUDGE, venomous bite with ptosis)',
];
