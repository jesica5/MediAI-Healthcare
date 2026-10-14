import { SymptomVector } from '../types';

export type DomainKey = keyof Omit<SymptomVector, 'medical_history'>;

export interface SymptomCheckboxDef {
  id: string;
  labelKey: string;
  labelEn: string;
  labelTa: string;
  isRedFlag?: boolean;
}

export interface SymptomSelectDef {
  id: string;
  labelKey: string;
  labelEn: string;
  labelTa: string;
  options: { value: string; labelEn: string; labelTa: string }[];
}

export interface SymptomNumberDef {
  id: string;
  labelKey: string;
  labelEn: string;
  labelTa: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export interface SymptomTextDef {
  id: string;
  labelKey: string;
  labelEn: string;
  labelTa: string;
  placeholderEn?: string;
  placeholderTa?: string;
  maxLength?: number;
}

export interface DomainDefinition {
  key: DomainKey;
  order: number;
  titleKey: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  checkboxes: SymptomCheckboxDef[];
  selects?: SymptomSelectDef[];
  numbers?: SymptomNumberDef[];
  texts?: SymptomTextDef[];
}

export const CLINICAL_DOMAINS: DomainDefinition[] = [
  // 1. Infection & Sepsis
  {
    key: 'infection_sepsis',
    order: 1,
    titleKey: 'symptoms.domains.infection_sepsis.title',
    titleEn: '1. Infection & Sepsis',
    titleTa: '1. தொற்று & செப்சிஸ்',
    descriptionEn: 'Systemic inflammatory response, septic shock risks, and localized severe infections.',
    descriptionTa: 'அமைப்புசார்ந்த அழற்சி எதிர்வினை, செப்டிக் அதிர்ச்சி அபாயங்கள்.',
    checkboxes: [
      {
        id: 'altered_mentation',
        labelKey: 'symptoms.domains.infection_sepsis.altered_mentation',
        labelEn: 'Altered Mental State / Confusion',
        labelTa: 'மனநிலை மாற்றம் / குழப்பம்',
        isRedFlag: true,
      },
      {
        id: 'rigors',
        labelKey: 'symptoms.domains.infection_sepsis.rigors',
        labelEn: 'Rigors / Severe Shaking Chills',
        labelTa: 'கடுமையான நடுக்கம் / குளிர் காய்ச்சல்',
      },
      {
        id: 'diaphoresis',
        labelKey: 'symptoms.domains.infection_sepsis.diaphoresis',
        labelEn: 'Diaphoresis / Heavy Drenching Sweating',
        labelTa: 'அதிக வியர்வை',
      },
      {
        id: 'fever',
        labelKey: 'symptoms.domains.infection_sepsis.fever',
        labelEn: 'High Fever (>38.5°C / 101.3°F)',
        labelTa: 'அதிக காய்ச்சல் (>38.5°C)',
      },
      {
        id: 'hypothermia',
        labelKey: 'symptoms.domains.infection_sepsis.hypothermia',
        labelEn: 'Core Hypothermia (<35.0°C / Unusually Cold)',
        labelTa: 'குறைந்த உடல் வெப்பநிலை (<35.0°C)',
        isRedFlag: true,
      },
      {
        id: 'fatigue_malaise',
        labelKey: 'symptoms.domains.infection_sepsis.fatigue_malaise',
        labelEn: 'Severe Prostration / Extreme Malaise',
        labelTa: 'கடுமையான சோர்வு / பலவீனம்',
      },
      {
        id: 'cellulitis_wound_infection',
        labelKey: 'symptoms.domains.infection_sepsis.cellulitis_wound_infection',
        labelEn: 'Localized Redness / Spreading Skin Infection',
        labelTa: 'தோல் தொற்று / பரவும் சிவப்புத்தன்மை',
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.infection_sepsis.other',
        labelEn: 'Other Infection / Sepsis Symptoms',
        labelTa: 'பிற தொற்று அறிகுறிகள்',
      },
    ],
  },

  // 2. Respiratory
  {
    key: 'respiratory',
    order: 2,
    titleKey: 'symptoms.domains.respiratory.title',
    titleEn: '2. Respiratory',
    titleTa: '2. சுவாச மண்டலம்',
    descriptionEn: 'Airway patency, work of breathing, gas exchange, and acute distress.',
    descriptionTa: 'சுவாசப்பாதை நிலை, மூச்சுத்திணறல், மற்றும் சுவாசக்கோளாறுகள்.',
    checkboxes: [
      {
        id: 'shortness_of_breath',
        labelKey: 'symptoms.domains.respiratory.shortnessOfBreath',
        labelEn: 'Severe Shortness of Breath / Dyspnea',
        labelTa: 'மூச்சுத்திணறல்',
        isRedFlag: true,
      },
      {
        id: 'accessory_muscle_use',
        labelKey: 'symptoms.domains.respiratory.accessory_muscle_use',
        labelEn: 'Accessory Muscle Use (Intercostal / Suprasternal retractions)',
        labelTa: 'சுவாசிக்க கூடுதல் தசைகளைப் பயன்படுத்துதல்',
        isRedFlag: true,
      },
      {
        id: 'stridor',
        labelKey: 'symptoms.domains.respiratory.stridor',
        labelEn: 'Stridor (High-pitched inspiratory sound)',
        labelTa: 'ஸ்ட்ரைடர் (மூச்செடுக்கும் போது அதிக சத்தம்)',
        isRedFlag: true,
      },
      {
        id: 'wheeze',
        labelKey: 'symptoms.domains.respiratory.wheeze',
        labelEn: 'Audible Wheezing / Expiratory Bronchospasm',
        labelTa: 'வீசிங் (மூச்சிரைப்பு சத்தம்)',
      },
      {
        id: 'chest_tightness',
        labelKey: 'symptoms.domains.respiratory.chest_tightness',
        labelEn: 'Chest Tightness with Respiration',
        labelTa: 'சுவாச நெஞ்சு இறுக்கம்',
      },
      {
        id: 'cyanosis',
        labelKey: 'symptoms.domains.respiratory.cyanosis',
        labelEn: 'Central Cyanosis (Bluish lips / tongue / nails)',
        labelTa: 'நீல நிற உதடுகள் / விரல்கள் (சயனோசிஸ்)',
        isRedFlag: true,
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.respiratory.other',
        labelEn: 'Other Respiratory Symptoms',
        labelTa: 'பிற சுவாச அறிகுறிகள்',
      },
    ],
    selects: [
      {
        id: 'cough_character',
        labelKey: 'symptoms.domains.respiratory.cough_character',
        labelEn: 'Cough Character',
        labelTa: 'இருமல் தன்மை',
        options: [
          { value: 'none', labelEn: 'No cough', labelTa: 'இருமல் இல்லை' },
          { value: 'dry', labelEn: 'Dry cough', labelTa: 'வறட்டு இருமல்' },
          { value: 'productive', labelEn: 'Productive (phlegm)', labelTa: 'சளி இருமல்' },
          { value: 'hemoptysis', labelEn: 'Coughing up blood (hemoptysis)', labelTa: 'இருமும் போது இரத்தம் வருதல்' },
        ],
      },
    ],
  },

  // 3. Cardiac
  {
    key: 'cardiac',
    order: 3,
    titleKey: 'symptoms.domains.cardiac.title',
    titleEn: '3. Cardiac',
    titleTa: '3. இருதய மண்டலம்',
    descriptionEn: 'Coronary perfusion, hemodynamics, arrhythmias, and acute coronary syndrome.',
    descriptionTa: 'மாரடைப்பு அறிகுறிகள், இருதய துடிப்பு மாற்றங்கள், இரத்த ஓட்டம்.',
    checkboxes: [
      {
        id: 'chest_pain',
        labelKey: 'symptoms.domains.cardiac.chestPain',
        labelEn: 'Acute Chest Pain / Heavy Pressure',
        labelTa: 'நெஞ்சு வலி / பாரம்',
        isRedFlag: true,
      },
      {
        id: 'diaphoresis',
        labelKey: 'symptoms.domains.cardiac.diaphoresis',
        labelEn: 'Cold Clammy Diaphoresis with Discomfort',
        labelTa: 'குளிர்ந்த வியர்வை',
      },
      {
        id: 'palpitations',
        labelKey: 'symptoms.domains.cardiac.palpitations',
        labelEn: 'Palpitations / Rapid Racing Heartbeat',
        labelTa: 'படபடப்பு / வேகமான இதயத் துடிப்பு',
      },
      {
        id: 'syncope',
        labelKey: 'symptoms.domains.cardiac.syncope',
        labelEn: 'Syncope / Near-Syncope / Unexplained Fainting',
        labelTa: 'மயக்கம் / திடீர் தலைசுற்றல்',
        isRedFlag: true,
      },
      {
        id: 'pedal_edema',
        labelKey: 'symptoms.domains.cardiac.pedal_edema',
        labelEn: 'Bilateral Pedal Edema (Ankle/Leg Swelling)',
        labelTa: 'இரு கால்களிலும் வீக்கம்',
      },
      {
        id: 'orthopnea',
        labelKey: 'symptoms.domains.cardiac.orthopnea',
        labelEn: 'Orthopnea (Inability to breathe lying flat)',
        labelTa: 'படுக்கும் போது மூச்சுத்திணறல்',
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.cardiac.other',
        labelEn: 'Other Cardiac Symptoms',
        labelTa: 'பிற இருதய அறிகுறிகள்',
      },
    ],
    selects: [
      {
        id: 'chest_pain_character',
        labelKey: 'symptoms.domains.cardiac.chest_pain_character',
        labelEn: 'Chest Pain Character',
        labelTa: 'நெஞ்சு வலியின் தன்மை',
        options: [
          { value: 'none', labelEn: 'No chest pain', labelTa: 'நெஞ்சு வலி இல்லை' },
          { value: 'pressure', labelEn: 'Pressure / Heaviness', labelTa: 'அழுத்தம் / பாரம்' },
          { value: 'sharp', labelEn: 'Sharp / Stabbing', labelTa: 'கூர்மையான / குத்து வலி' },
          { value: 'tearing', labelEn: 'Tearing / Ripping', labelTa: 'கிழிப்பது போன்ற வலி' },
          { value: 'burning', labelEn: 'Burning', labelTa: 'எரிச்சல் உணர்வு' },
          { value: 'other', labelEn: 'Other', labelTa: 'பிற தன்மை' },
        ],
      },
      {
        id: 'radiation',
        labelKey: 'symptoms.domains.cardiac.radiation',
        labelEn: 'Pain Radiation',
        labelTa: 'வலி பரவுதல்',
        options: [
          { value: 'none', labelEn: 'No radiation', labelTa: 'வலி பரவவில்லை' },
          { value: 'left_arm', labelEn: 'Left arm', labelTa: 'இடது கை' },
          { value: 'jaw', labelEn: 'Jaw or neck', labelTa: 'தாடை அல்லது கழுத்து' },
          { value: 'back', labelEn: 'Back / interscapular', labelTa: 'முதுகுப் பகுதி' },
          { value: 'both_arms', labelEn: 'Both arms', labelTa: 'இரு கைகளிலும்' },
          { value: 'other', labelEn: 'Other location', labelTa: 'பிற இடம்' },
        ],
      },
    ],
  },

  // 4. Neurological
  {
    key: 'neurological',
    order: 4,
    titleKey: 'symptoms.domains.neurological.title',
    titleEn: '4. Neurological',
    titleTa: '4. நரம்பியல் மண்டலம்',
    descriptionEn: 'Acute stroke deficits, altered mental status, seizures, and cranial nerve signs.',
    descriptionTa: 'பக்கவாதம் அறிகுறிகள், வலிப்பு, மயக்கம், நரம்பியல் கோளாறுகள்.',
    checkboxes: [
      {
        id: 'fast_facial_droop',
        labelKey: 'symptoms.domains.neurological.fast_facial_droop',
        labelEn: 'FAST: Facial Droop / Asymmetry',
        labelTa: 'முகக் கோணல் (FAST: Facial Droop)',
        isRedFlag: true,
      },
      {
        id: 'fast_arm_drift',
        labelKey: 'symptoms.domains.neurological.fast_arm_drift',
        labelEn: 'FAST: Arm Drift / Unilateral Weakness',
        labelTa: 'கை பலவீனம் (FAST: Arm Drift)',
        isRedFlag: true,
      },
      {
        id: 'fast_speech_difficulty',
        labelKey: 'symptoms.domains.neurological.fast_speech_difficulty',
        labelEn: 'FAST: Speech Difficulty / Slurred Speech',
        labelTa: 'பேச்சுத் தடுமாற்றம் (FAST: Speech Difficulty)',
        isRedFlag: true,
      },
      {
        id: 'seizures',
        labelKey: 'symptoms.domains.neurological.seizures',
        labelEn: 'Seizure Activity / Convulsions / Post-Ictal State',
        labelTa: 'வலிப்பு / இழுப்பு',
        isRedFlag: true,
      },
      {
        id: 'dizziness_fainting',
        labelKey: 'symptoms.domains.neurological.dizzinessFainting',
        labelEn: 'Dizziness / Vertigo / Loss of Balance',
        labelTa: 'தலைச்சுற்றல் / மயக்கம்',
      },
      {
        id: 'severe_thunderclap_headache',
        labelKey: 'symptoms.domains.neurological.severe_thunderclap_headache',
        labelEn: 'Sudden Severe "Thunderclap" Headache',
        labelTa: 'திடீர் தீவிர கடுமையான தலைவலி',
        isRedFlag: true,
      },
      {
        id: 'numbness_weakness',
        labelKey: 'symptoms.domains.neurological.numbness_weakness',
        labelEn: 'Unilateral Numbness / Loss of Sensation',
        labelTa: 'ஒரு பக்க உணர்வின்மை / மரத்துப்போதல்',
      },
      {
        id: 'confusion_delirium',
        labelKey: 'symptoms.domains.neurological.confusion_delirium',
        labelEn: 'Acute Disorientation / Agitation / Delirium',
        labelTa: 'திடீர் மனக்குழப்பம் / சுயநினைவு தடுமாற்றம்',
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.neurological.other',
        labelEn: 'Other Neurological Symptoms',
        labelTa: 'பிற நரம்பியல் அறிகுறிகள்',
      },
    ],
    numbers: [
      {
        id: 'gcs_score',
        labelKey: 'symptoms.domains.neurological.gcs_score',
        labelEn: 'Glasgow Coma Scale (GCS 3 - 15)',
        labelTa: 'கிளாஸ்கோ கோமா அளவுகோல் (GCS 3 - 15)',
        min: 3,
        max: 15,
      },
    ],
    selects: [
      {
        id: 'pupil_response',
        labelKey: 'symptoms.domains.neurological.pupil_response',
        labelEn: 'Pupillary Light Reflex',
        labelTa: 'கண் பாவை ஒளி எதிர்வினை',
        options: [
          { value: 'normal', labelEn: 'Normal / Reactive', labelTa: 'இயல்பானது' },
          { value: 'sluggish', labelEn: 'Sluggish', labelTa: 'மந்தமானது' },
          { value: 'unresponsive', labelEn: 'Fixed / Unresponsive', labelTa: 'எதிர்வினையற்றது' },
          { value: 'asymmetric', labelEn: 'Asymmetric (unequal)', labelTa: 'சமச்சீரற்றது' },
        ],
      },
    ],
  },

  // 5. Blood Pressure Associated Symptoms
  {
    key: 'blood_pressure',
    order: 5,
    titleKey: 'symptoms.domains.blood_pressure.title',
    titleEn: '5. Blood Pressure Associated Symptoms',
    titleTa: '5. இரத்த அழுத்தம் சார்ந்த அறிகுறிகள்',
    descriptionEn: 'Hypertensive emergency signs, organ damage indicators, and acute hypotension.',
    descriptionTa: 'தீவிர உயர் இரத்த அழுத்தம், தலைவலி, மங்கலான பார்வை அறிகுறிகள்.',
    checkboxes: [
      {
        id: 'severe_headache',
        labelKey: 'symptoms.domains.blood_pressure.severe_headache',
        labelEn: 'Severe Occipital / Throbbing Headache',
        labelTa: 'கடுமையான தலைவலி',
        isRedFlag: true,
      },
      {
        id: 'chest_pain',
        labelKey: 'symptoms.domains.blood_pressure.chest_pain',
        labelEn: 'Concurrent Chest Discomfort / Pressure',
        labelTa: 'நெஞ்சு அசௌகரியம்',
      },
      {
        id: 'blurred_vision',
        labelKey: 'symptoms.domains.blood_pressure.blurred_vision',
        labelEn: 'Acute Blurred Vision / Visual Scotoma',
        labelTa: 'மங்கலான அல்லது இரட்டைப் பார்வை',
      },
      {
        id: 'epistaxis',
        labelKey: 'symptoms.domains.blood_pressure.epistaxis',
        labelEn: 'Severe Spontaneous Epistaxis (Nosebleed)',
        labelTa: 'மூக்கில் தீவிர இரத்தப்போக்கு',
      },
      {
        id: 'dizziness_standing',
        labelKey: 'symptoms.domains.blood_pressure.dizziness_standing',
        labelEn: 'Orthostatic Lightheadedness / Near-Syncope on Standing',
        labelTa: 'எழுந்து நிற்கும்போது தலைச்சுற்றல்',
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.blood_pressure.other',
        labelEn: 'Other Blood Pressure Symptoms',
        labelTa: 'பிற இரத்த அழுத்த அறிகுறிகள்',
      },
    ],
  },

  // 6. Diabetes & Metabolic
  {
    key: 'diabetes',
    order: 6,
    titleKey: 'symptoms.domains.diabetes.title',
    titleEn: '6. Diabetes & Metabolic',
    titleTa: '6. நீரிழிவு & வளர்சிதை மாற்றம்',
    descriptionEn: 'Diabetic ketoacidosis, hyperosmolar crises, and severe hypoglycemia.',
    descriptionTa: 'நீரிழிவு கோமா அபாயங்கள், குறைந்த/அதிக இரத்த சர்க்கரை பாதிப்புகள்.',
    checkboxes: [
      {
        id: 'kussmaul_breathing',
        labelKey: 'symptoms.domains.diabetes.kussmaul_breathing',
        labelEn: 'Deep Rapid Sighing Breathing (Kussmaul Respirations)',
        labelTa: 'வேகமான ஆழ்ந்த சுவாசம் (குஸ்மால் சுவாசம்)',
        isRedFlag: true,
      },
      {
        id: 'fruity_breath',
        labelKey: 'symptoms.domains.diabetes.fruity_breath',
        labelEn: 'Fruity / Acetone Ketotic Breath Odor',
        labelTa: 'பழ வாசனை / அசிட்டோன் மூச்சு',
        isRedFlag: true,
      },
      {
        id: 'polydipsia_polyuria',
        labelKey: 'symptoms.domains.diabetes.polydipsia_polyuria',
        labelEn: 'Severe Excessive Thirst & Frequent Urination',
        labelTa: 'அதிக தாகம் & அதிக சிறுநீர் வெளியேற்றம்',
      },
      {
        id: 'hypoglycemia_symptoms',
        labelKey: 'symptoms.domains.diabetes.hypoglycemia_symptoms',
        labelEn: 'Tremors, Diaphoresis & Palpitations (Hypoglycemia)',
        labelTa: 'நடுக்கம் / வியர்வை (குறைந்த சர்க்கரை நிலை)',
      },
      {
        id: 'extreme_fatigue',
        labelKey: 'symptoms.domains.diabetes.extreme_fatigue',
        labelEn: 'Profound Lethargy / Muscle Weakness',
        labelTa: 'தீவிர சோர்வு / தசை பலவீனம்',
      },
      {
        id: 'nausea_vomiting_dka',
        labelKey: 'symptoms.domains.diabetes.nausea_vomiting_dka',
        labelEn: 'Severe Abdominal Pain / Vomiting in Diabetic',
        labelTa: 'நீரிழிவு நோயில் கடுமையான வயிற்று வலி / வாந்தி',
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.diabetes.other',
        labelEn: 'Other Diabetic & Metabolic Symptoms',
        labelTa: 'பிற நீரிழிவு அறிகுறிகள்',
      },
    ],
  },

  // 7. Gastrointestinal
  {
    key: 'gastrointestinal',
    order: 7,
    titleKey: 'symptoms.domains.gastrointestinal.title',
    titleEn: '7. Gastrointestinal',
    titleTa: '7. இரைப்பை குடல் மண்டலம்',
    descriptionEn: 'Acute abdomen, peritonitis, GI bleeding, and severe fluid loss.',
    descriptionTa: 'கடுமையான வயிற்று வலி, இரத்த வாந்தி, குடல் இரத்தப்போக்கு.',
    checkboxes: [
      {
        id: 'severe_abdominal_pain',
        labelKey: 'symptoms.domains.gastrointestinal.severeAbdominalPain',
        labelEn: 'Severe Acute Abdominal Pain',
        labelTa: 'கடுமையான வயிற்று வலி',
        isRedFlag: true,
      },
      {
        id: 'rebound_tenderness',
        labelKey: 'symptoms.domains.gastrointestinal.rebound_tenderness',
        labelEn: 'Rebound Tenderness / Involuntary Guarding / Rigidity',
        labelTa: 'அழுத்தி விடும்போது வலி / தசை இறுக்கம்',
        isRedFlag: true,
      },
      {
        id: 'nausea_vomiting',
        labelKey: 'symptoms.domains.gastrointestinal.nausea_vomiting',
        labelEn: 'Persistent Intractable Nausea & Vomiting',
        labelTa: 'தொடர் வாந்தி மற்றும் குமட்டல்',
      },
      {
        id: 'hematemesis',
        labelKey: 'symptoms.domains.gastrointestinal.hematemesis',
        labelEn: 'Hematemesis (Vomiting Fresh Blood or Coffee-Ground)',
        labelTa: 'இரத்த வாந்தி / காபித்தூள் நிற வாந்தி',
        isRedFlag: true,
      },
      {
        id: 'rectal_bleeding_melena',
        labelKey: 'symptoms.domains.gastrointestinal.rectal_bleeding_melena',
        labelEn: 'Melena / Fresh Blood in Stool (Hematochezia)',
        labelTa: 'கருப்பு மலம் / மலத்தில் இரத்தக் கசிவு',
        isRedFlag: true,
      },
      {
        id: 'severe_diarrhea',
        labelKey: 'symptoms.domains.gastrointestinal.severe_diarrhea',
        labelEn: 'Profuse Watery Diarrhea (>5 episodes in 24h)',
        labelTa: 'கடுமையான நீர்த்த வயிற்றுப்போக்கு',
      },
      {
        id: 'abdominal_distension',
        labelKey: 'symptoms.domains.gastrointestinal.abdominal_distension',
        labelEn: 'Marked Abdominal Distension / Obstipation',
        labelTa: 'வயிறு தீவிரமாக உப்புசம் அடைதல்',
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.gastrointestinal.other',
        labelEn: 'Other Gastrointestinal Symptoms',
        labelTa: 'பிற இரைப்பை குடல் அறிகுறிகள்',
      },
    ],
    selects: [
      {
        id: 'pain_quadrant',
        labelKey: 'symptoms.domains.gastrointestinal.pain_quadrant',
        labelEn: 'Abdominal Pain Location',
        labelTa: 'வயிற்று வலி இருக்கும் இடம்',
        options: [
          { value: 'none', labelEn: 'No pain', labelTa: 'வலி இல்லை' },
          { value: 'RUQ', labelEn: 'Right Upper Quadrant (RUQ)', labelTa: 'வலது மேல் பகுதி' },
          { value: 'LUQ', labelEn: 'Left Upper Quadrant (LUQ)', labelTa: 'இடது மேல் பகுதி' },
          { value: 'RLQ', labelEn: 'Right Lower Quadrant (RLQ)', labelTa: 'வலது கீழ் பகுதி' },
          { value: 'LLQ', labelEn: 'Left Lower Quadrant (LLQ)', labelTa: 'இடது கீழ் பகுதி' },
          { value: 'epigastric', labelEn: 'Epigastric', labelTa: 'மேல் நடு வயிறு' },
          { value: 'periumbilical', labelEn: 'Periumbilical', labelTa: 'தொப்புள் பகுதி' },
          { value: 'diffuse', labelEn: 'Diffuse (generalized)', labelTa: 'வயிறு முழுவதும்' },
        ],
      },
      {
        id: 'emesis',
        labelKey: 'symptoms.domains.gastrointestinal.emesis',
        labelEn: 'Vomiting Character',
        labelTa: 'வாந்தி தன்மை',
        options: [
          { value: 'none', labelEn: 'None', labelTa: 'வாந்தி இல்லை' },
          { value: 'clear', labelEn: 'Clear / Non-bilious', labelTa: 'தெளிவான வாந்தி' },
          { value: 'bilious', labelEn: 'Bilious (green/yellow)', labelTa: 'பித்த வாந்தி (பச்சை/மஞ்சள்)' },
          { value: 'coffee_ground', labelEn: 'Coffee-ground emesis', labelTa: 'காபித்தூள் நிற வாந்தி' },
          { value: 'hematemesis', labelEn: 'Fresh Blood (hematemesis)', labelTa: 'இரத்த வாந்தி' },
        ],
      },
      {
        id: 'stool_color',
        labelKey: 'symptoms.domains.gastrointestinal.stool_color',
        labelEn: 'Stool Character',
        labelTa: 'மலம் தன்மை',
        options: [
          { value: 'normal', labelEn: 'Normal', labelTa: 'இயல்பானது' },
          { value: 'melena', labelEn: 'Black / Tarry (Melena)', labelTa: 'கருப்பு மலம் (மெலினா)' },
          { value: 'hematochezia', labelEn: 'Red Blood (Hematochezia)', labelTa: 'இரத்தக் கசிவு மலம்' },
          { value: 'clay_colored', labelEn: 'Clay-colored / Pale', labelTa: 'வெளிறிய மலம்' },
        ],
      },
    ],
  },

  // 8. Injury & Trauma
  {
    key: 'injury_trauma',
    order: 8,
    titleKey: 'symptoms.domains.injury_trauma.title',
    titleEn: '8. Injury & Trauma',
    titleTa: '8. காயம் & விபத்து',
    descriptionEn: 'Mechanical injuries, hemorrhage control, fractures, and blunt/penetrating trauma.',
    descriptionTa: 'விபத்துக் காயங்கள், இரத்தப்போக்கு, எலும்பு முறிவு மற்றும் தீக்காயங்கள்.',
    checkboxes: [
      {
        id: 'deformity',
        labelKey: 'symptoms.domains.injury_trauma.deformity',
        labelEn: 'Visible Bone or Joint Deformity',
        labelTa: 'எலும்பு / மூட்டு சிதைவு',
        isRedFlag: true,
      },
      {
        id: 'blunt_head_trauma',
        labelKey: 'symptoms.domains.injury_trauma.blunt_head_trauma',
        labelEn: 'Head Injury with Loss of Consciousness / Confusion',
        labelTa: 'தலையில் காயம் / சுயநினைவு இழப்பு',
        isRedFlag: true,
      },
      {
        id: 'active_bleeding',
        labelKey: 'symptoms.domains.injury_trauma.active_bleeding',
        labelEn: 'Active Uncontrolled Bleeding / Arterial Spurting',
        labelTa: 'கட்டுப்படுத்த முடியாத தீவிர இரத்தப்போக்கு',
        isRedFlag: true,
      },
      {
        id: 'fracture_dislocation',
        labelKey: 'symptoms.domains.injury_trauma.fracture_dislocation',
        labelEn: 'Suspected Bone Fracture / Inability to Bear Weight',
        labelTa: 'எலும்பு முறிவு சந்தேகம் / நடக்க இயலாமை',
      },
      {
        id: 'burn_injury',
        labelKey: 'symptoms.domains.injury_trauma.burn_injury',
        labelEn: 'Thermal, Chemical, or Electrical Burn',
        labelTa: 'தீக்காயம் / இரசாயனக் காயம்',
      },
      {
        id: 'spinal_tenderness',
        labelKey: 'symptoms.domains.injury_trauma.spinal_tenderness',
        labelEn: 'Midline Neck / Spinal Pain or Neurologic Deficit',
        labelTa: 'கழுத்து அல்லது தண்டுவட வலி / உணர்வின்மை',
        isRedFlag: true,
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.injury_trauma.other',
        labelEn: 'Other Injury & Trauma Symptoms',
        labelTa: 'பிற காயம் அறிகுறிகள்',
      },
    ],
    selects: [
      {
        id: 'mechanism',
        labelKey: 'symptoms.domains.injury_trauma.mechanism',
        labelEn: 'Injury Mechanism',
        labelTa: 'விபத்து / காயம் ஏற்பட்ட விதம்',
        options: [
          { value: 'none', labelEn: 'None', labelTa: 'எதுவுமில்லை' },
          { value: 'blunt', labelEn: 'Blunt impact', labelTa: 'மழுங்கிய அடி' },
          { value: 'penetrating', labelEn: 'Penetrating trauma', labelTa: 'ஊடுருவும் காயம்' },
          { value: 'fall', labelEn: 'Fall', labelTa: 'கீழே விழுதல்' },
          { value: 'mva', labelEn: 'Motor vehicle collision', labelTa: 'வாகன விபத்து' },
          { value: 'burn', labelEn: 'Thermal / Chemical burn', labelTa: 'தீக்காயம் / இரசாயனக் காயம்' },
          { value: 'other', labelEn: 'Other trauma', labelTa: 'பிற காயங்கள்' },
        ],
      },
      {
        id: 'bleeding_rate',
        labelKey: 'symptoms.domains.injury_trauma.bleeding_rate',
        labelEn: 'Active Bleeding Rate',
        labelTa: 'இரத்தப்போக்கு வேகம்',
        options: [
          { value: 'none', labelEn: 'None', labelTa: 'இரத்தப்போக்கு இல்லை' },
          { value: 'controlled', labelEn: 'Controlled / Minor', labelTa: 'கட்டுப்படுத்தப்பட்ட / லேசான' },
          { value: 'rapid', labelEn: 'Rapid bleeding', labelTa: 'அதிவேக இரத்தப்போக்கு' },
          { value: 'pulsatile', labelEn: 'Pulsatile / Arterial', labelTa: 'பீறிடும் தமனி இரத்தப்போக்கு' },
        ],
      },
      {
        id: 'airway_patency',
        labelKey: 'symptoms.domains.injury_trauma.airway_patency',
        labelEn: 'Airway Patency',
        labelTa: 'சுவாசப்பாதை நிலை',
        options: [
          { value: 'patent', labelEn: 'Patent / Clear', labelTa: 'தெளிவானது' },
          { value: 'threatened', labelEn: 'Threatened', labelTa: 'அபாயத்தில் உள்ளது' },
          { value: 'obstructed', labelEn: 'Obstructed', labelTa: 'அடைப்பு ஏற்பட்டுள்ளது' },
        ],
      },
    ],
  },

  // 9. Pregnancy & Obstetric
  {
    key: 'pregnancy',
    order: 9,
    titleKey: 'symptoms.domains.pregnancy.title',
    titleEn: '9. Pregnancy & Obstetric',
    titleTa: '9. கர்ப்பம் & மகப்பேறு',
    descriptionEn: 'Ectopic pregnancy risks, pre-eclampsia, placental complications, and obstetric hemorrhage.',
    descriptionTa: 'கர்ப்பகால சிக்கல்கள், உயர் இரத்த அழுத்தம், இரத்தப்போக்கு அறிகுறிகள்.',
    checkboxes: [
      {
        id: 'pelvic_pain',
        labelKey: 'symptoms.domains.pregnancy.pelvic_pain',
        labelEn: 'Severe Acute Pelvic / Lower Abdominal Pain',
        labelTa: 'கடுமையான இடுப்பு வலி',
        isRedFlag: true,
      },
      {
        id: 'vaginal_bleeding',
        labelKey: 'symptoms.domains.pregnancy.vaginal_bleeding',
        labelEn: 'Active Vaginal Bleeding',
        labelTa: 'யோனி இரத்தப்போக்கு',
        isRedFlag: true,
      },
      {
        id: 'severe_headache',
        labelKey: 'symptoms.domains.pregnancy.severe_headache',
        labelEn: 'Severe Headache / Visual Flashes (Pre-eclampsia sign)',
        labelTa: 'கடுமையான தலைவலி / பார்வை மங்கல்',
        isRedFlag: true,
      },
      {
        id: 'fluid_leakage',
        labelKey: 'symptoms.domains.pregnancy.fluid_leakage',
        labelEn: 'Sudden Amniotic Fluid Leakage / Rupture of Membranes',
        labelTa: 'திடீர் பனிக்குட நீர் கசிவு',
      },
      {
        id: 'reduced_fetal_movement',
        labelKey: 'symptoms.domains.pregnancy.reduced_fetal_movement',
        labelEn: 'Marked Reduction or Cessation of Fetal Movements',
        labelTa: 'கருவின் அசைவு குறைதல் அல்லது இல்லாமை',
      },
      {
        id: 'facial_edema',
        labelKey: 'symptoms.domains.pregnancy.facial_edema',
        labelEn: 'Sudden Swelling of Face, Hands, or Eyes',
        labelTa: 'திடீர் முகம், கை அல்லது கண் வீக்கம்',
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.pregnancy.other',
        labelEn: 'Other Pregnancy & Obstetric Symptoms',
        labelTa: 'பிற மகப்பேறு அறிகுறிகள்',
      },
    ],
    numbers: [
      {
        id: 'gestational_age_weeks',
        labelKey: 'symptoms.domains.pregnancy.gestational_age_weeks',
        labelEn: 'Gestational Age (weeks 1 - 45)',
        labelTa: 'கர்ப்ப வாரம் (1 - 45)',
        min: 1,
        max: 45,
        unit: 'weeks',
      },
    ],
  },

  // 10. Allergic & Anaphylaxis
  {
    key: 'allergic',
    order: 10,
    titleKey: 'symptoms.domains.allergic.title',
    titleEn: '10. Allergic & Anaphylaxis',
    titleTa: '10. ஒவ்வாமை & அனாபிலாக்ஸிஸ்',
    descriptionEn: 'Severe hypersensitivity reactions, acute airway angioedema, and anaphylactic shock.',
    descriptionTa: 'கடுமையான ஒவ்வாமை எதிர்வினைகள், காற்றுப்பாதை வீக்கம், அனாபிலாக்ஸிஸ்.',
    checkboxes: [
      {
        id: 'urticaria',
        labelKey: 'symptoms.domains.allergic.urticaria',
        labelEn: 'Urticaria / Widespread Hives & Erythema',
        labelTa: 'தோல் தடிப்புகள் / அரிப்பு (தடிப்பு)',
      },
      {
        id: 'mucosal_swelling',
        labelKey: 'symptoms.domains.allergic.mucosal_swelling',
        labelEn: 'Lip / Tongue / Mucosal Swelling (Angioedema)',
        labelTa: 'உதடு / நாக்கு வீக்கம் (ஆஞ்சியோடெமா)',
        isRedFlag: true,
      },
      {
        id: 'voice_change',
        labelKey: 'symptoms.domains.allergic.voice_change',
        labelEn: 'Hoarseness / Stridor / Sudden Voice Change',
        labelTa: 'குரல் மாற்றம் / கரகரப்பு',
        isRedFlag: true,
      },
      {
        id: 'wheeze',
        labelKey: 'symptoms.domains.allergic.wheeze',
        labelEn: 'Audible Wheezing / Bronchospasm',
        labelTa: 'வீசிங் (மூச்சிரைப்பு சத்தம்)',
      },
      {
        id: 'throat_tightness',
        labelKey: 'symptoms.domains.allergic.throat_tightness',
        labelEn: 'Sensation of Throat Closing / Difficulty Swallowing',
        labelTa: 'தொண்டை அடைப்பது போன்ற உணர்வு / விழுங்குவதில் சிரமம்',
        isRedFlag: true,
      },
      {
        id: 'facial_swelling',
        labelKey: 'symptoms.domains.allergic.facial_swelling',
        labelEn: 'Acute Facial / Periorbital Swelling',
        labelTa: 'முகம் மற்றும் கண் வீக்கம்',
      },
      {
        id: 'generalized_pruritus',
        labelKey: 'symptoms.domains.allergic.generalized_pruritus',
        labelEn: 'Severe Generalized Itching / Cutaneous Flushing',
        labelTa: 'உடல் முழுவதும் தீவிர அரிப்பு / சிவந்துபோதல்',
      },
      {
        id: 'anaphylaxis_history',
        labelKey: 'symptoms.domains.allergic.anaphylaxis_history',
        labelEn: 'Exposure to Known Severe Allergen (Food, Drug, Bee/Insect Sting)',
        labelTa: 'ஒவ்வாமை காரணியுடன் தொடர்பு (உணவு, மருந்து, பூச்சிக்கடி)',
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.allergic.other',
        labelEn: 'Other Allergic Symptoms',
        labelTa: 'பிற ஒவ்வாமை அறிகுறிகள்',
      },
    ],
  },

  // 11. Hydration Status
  {
    key: 'dehydration',
    order: 11,
    titleKey: 'symptoms.domains.dehydration.title',
    titleEn: '11. Hydration Status',
    titleTa: '11. நீரிழப்பு நிலை',
    descriptionEn: 'Hypovolemia assessment, capillary refill, mucosal moisture, and acute kidney injury risk.',
    descriptionTa: 'உடலில் நீர்ச்சத்து குறைபாடு, வாய் வறட்சி, சிறுநீர் அளவு குறைதல்.',
    checkboxes: [
      {
        id: 'extreme_thirst',
        labelKey: 'symptoms.domains.dehydration.extreme_thirst',
        labelEn: 'Severe Intense Thirst & Parched Dry Mouth',
        labelTa: 'தீவிர தாகம் / வறண்ட வாய்',
      },
      {
        id: 'sunken_eyes',
        labelKey: 'symptoms.domains.dehydration.sunken_eyes',
        labelEn: 'Sunken Eyes / Severely Diminished Skin Turgor',
        labelTa: 'குழிவிழுந்த கண்கள் / தோல் சுருக்கம்',
      },
      {
        id: 'anuria_oliguria',
        labelKey: 'symptoms.domains.dehydration.anuria_oliguria',
        labelEn: 'Anuria / No Urine Output for 8+ Hours',
        labelTa: '8 மணி நேரமாக சிறுநீர் கழிக்காமை (அனூரியா)',
        isRedFlag: true,
      },
      {
        id: 'postural_dizziness',
        labelKey: 'symptoms.domains.dehydration.postural_dizziness',
        labelEn: 'Severe Postural Dizziness / Fainting on Standing',
        labelTa: 'எழுந்து நிற்கும்போது மயக்கம் / தடுமாற்றம்',
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.dehydration.other',
        labelEn: 'Other Hydration Symptoms',
        labelTa: 'பிற நீரிழப்பு அறிகுறிகள்',
      },
    ],
    selects: [
      {
        id: 'skin_turgor',
        labelKey: 'symptoms.domains.dehydration.skin_turgor',
        labelEn: 'Skin Turgor',
        labelTa: 'தோல் மீள்தன்மை',
        options: [
          { value: 'normal', labelEn: 'Normal / Elastic', labelTa: 'இயல்பானது' },
          { value: 'reduced', labelEn: 'Reduced recoil', labelTa: 'குறைந்தது' },
          { value: 'tented', labelEn: 'Tented / Poor', labelTa: 'சுருங்கியது' },
        ],
      },
      {
        id: 'mucous_membranes',
        labelKey: 'symptoms.domains.dehydration.mucous_membranes',
        labelEn: 'Mucous Membranes',
        labelTa: 'வாய் / சளி சவ்வு ஈரப்பதம்',
        options: [
          { value: 'moist', labelEn: 'Moist', labelTa: 'ஈரமானது' },
          { value: 'dry', labelEn: 'Dry', labelTa: 'வறண்டது' },
          { value: 'very_dry', labelEn: 'Cracked / Very dry', labelTa: 'மிகவும் வறண்டது / வெடித்தது' },
        ],
      },
      {
        id: 'urine_output',
        labelKey: 'symptoms.domains.dehydration.urine_output',
        labelEn: 'Reported Urine Output',
        labelTa: 'சிறுநீர் வெளியேற்றம்',
        options: [
          { value: 'normal', labelEn: 'Normal', labelTa: 'இயல்பானது' },
          { value: 'reduced', labelEn: 'Decreased / Dark', labelTa: 'குறைந்தது' },
          { value: 'none', labelEn: 'None in last 8+ hours', labelTa: 'கடந்த 8 மணி நேரத்தில் இல்லை' },
        ],
      },
    ],
    numbers: [
      {
        id: 'capillary_refill_seconds',
        labelKey: 'symptoms.domains.dehydration.capillary_refill_seconds',
        labelEn: 'Capillary Refill Time (seconds)',
        labelTa: 'கேபிலரி ரீஃபில் நேரம் (வினாடிகள்)',
        min: 0,
        max: 15,
        step: 0.5,
        unit: 's',
      },
    ],
  },

  // 12. Multi-system & Toxic Exposure
  {
    key: 'toxic_exposure',
    order: 12,
    titleKey: 'symptoms.domains.toxic_exposure.title',
    titleEn: '12. Multi-system & Toxic Exposure',
    titleTa: '12. நச்சு வெளிப்பாடு & பாதிப்புகள்',
    descriptionEn: 'Poisonings, envenomation (snake/scorpion), toxic inhalations, and toxidromes.',
    descriptionTa: 'நச்சுப் பொருட்கள், பாம்புக் கடி, பூச்சிக்கடி மற்றும் வாயு சுவாசித்தல்.',
    checkboxes: [
      {
        id: 'puncture_marks',
        labelKey: 'symptoms.domains.toxic_exposure.puncture_marks',
        labelEn: 'Bite / Sting / Puncture Marks (Snake / Scorpion / Spider)',
        labelTa: 'கடி / கொட்டு / ஊசி தடயங்கள்',
        isRedFlag: true,
      },
      {
        id: 'snake_animal_bite',
        labelKey: 'symptoms.domains.toxic_exposure.snake_animal_bite',
        labelEn: 'Definite Venomous Snake or Rabid Animal Bite',
        labelTa: 'விஷப் பாம்பு அல்லது விலங்கு கடி',
        isRedFlag: true,
      },
      {
        id: 'chemical_poisoning',
        labelKey: 'symptoms.domains.toxic_exposure.chemical_poisoning',
        labelEn: 'Known or Suspected Chemical / Pesticide / Medication Ingestion',
        labelTa: 'இரசாயனம் / பூச்சிக்கொல்லி / அதிக மருந்து உட்கொள்ளல்',
        isRedFlag: true,
      },
      {
        id: 'smoke_inhalation',
        labelKey: 'symptoms.domains.toxic_exposure.smoke_inhalation',
        labelEn: 'Toxic Smoke, Fume, or Carbon Monoxide Inhalation',
        labelTa: 'நச்சுப் புகை அல்லது வாயு சுவாசித்தல்',
        isRedFlag: true,
      },
      {
        id: 'loss_of_consciousness_toxin',
        labelKey: 'symptoms.domains.toxic_exposure.loss_of_consciousness_toxin',
        labelEn: 'Sudden Unresponsiveness / Collapse after Exposure',
        labelTa: 'நச்சு வெளிப்பாட்டிற்கு பின் உடனடி மயக்கம்',
        isRedFlag: true,
      },
      {
        id: 'hypersalivation_lacrimation',
        labelKey: 'symptoms.domains.toxic_exposure.hypersalivation_lacrimation',
        labelEn: 'Excessive Salivation / Lacrimation / Sweating (Cholinergic toxidrome)',
        labelTa: 'அதிகப்படியான எச்சில் மற்றும் கண்ணீர் சுரப்பு',
      },
      {
        id: 'other',
        labelKey: 'symptoms.domains.toxic_exposure.other',
        labelEn: 'Other Toxic Exposure Symptoms',
        labelTa: 'பிற நச்சு அறிகுறிகள்',
      },
    ],
    texts: [
      {
        id: 'substance_ingested',
        labelKey: 'symptoms.domains.toxic_exposure.substance_ingested',
        labelEn: 'Suspected Substance / Toxin Ingested',
        labelTa: 'உட்கொண்டதாக சந்தேகிக்கப்படும் நச்சு / பொருள்',
        placeholderEn: 'e.g. Paracetamol overdose, organophosphate, bleach',
        placeholderTa: 'எ.கா. அதிக மாத்திரை, பூச்சிக்கொல்லி',
        maxLength: 200,
      },
    ],
    selects: [
      {
        id: 'salivation',
        labelKey: 'symptoms.domains.toxic_exposure.salivation',
        labelEn: 'Salivation Character',
        labelTa: 'எச்சில் சுரப்பு',
        options: [
          { value: 'normal', labelEn: 'Normal', labelTa: 'இயல்பானது' },
          { value: 'excessive', labelEn: 'Excessive (hypersalivation)', labelTa: 'அதிகப்படியான எச்சில்' },
          { value: 'dry', labelEn: 'Dry mouth', labelTa: 'வறண்ட வாய்' },
        ],
      },
      {
        id: 'pupil_size',
        labelKey: 'symptoms.domains.toxic_exposure.pupil_size',
        labelEn: 'Pupil Size',
        labelTa: 'கண் பாவை அளவு',
        options: [
          { value: 'normal', labelEn: 'Normal (3 - 5mm)', labelTa: 'இயல்பானது (3 - 5mm)' },
          { value: 'pinpoint', labelEn: 'Pinpoint (<2mm)', labelTa: 'மிகச் சிறியது (<2mm)' },
          { value: 'dilated', labelEn: 'Dilated (>6mm)', labelTa: 'விரிவடைந்தது (>6mm)' },
        ],
      },
    ],
  },
];
