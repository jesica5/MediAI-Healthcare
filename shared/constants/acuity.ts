export const CLINICAL_ACUITY_TOKENS = {
  CRITICAL: {
    color: '#E53E3E',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-600 dark:text-red-400',
    labelEn: 'Critical (Priority 1)',
    labelTa: 'முக்கியமானது (முன்னுரிமை 1)',
  },
  HIGH: {
    color: '#ED8936',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-600 dark:text-orange-400',
    labelEn: 'High (Priority 2)',
    labelTa: 'அவசரம் (முன்னுரிமை 2)',
  },
  MODERATE: {
    color: '#ECC94B',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    labelEn: 'Moderate (Priority 3)',
    labelTa: 'மிதமான (முன்னுரிமை 3)',
  },
  LOW: {
    color: '#38A169',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-600 dark:text-green-400',
    labelEn: 'Low (Priority 4)',
    labelTa: 'குறைந்த (முன்னுரிமை 4)',
  },
} as const;

export const CLINICAL_DISCLAIMER_EN =
  'MediAI is an AI-assisted clinical decision-support prototype. It supports healthcare assessment and does not independently diagnose conditions, prescribe medications, or replace certified clinical judgment.';

export const CLINICAL_DISCLAIMER_TA =
  'MediAI என்பது AI-உதவி பெறும் மருத்துவ முடிவு-ஆதரவு முன்மாதிரியாகும். இது சுகாதார மதிப்பீட்டை ஆதரிக்கிறது மற்றும் சுயாதீனமாக நோய்களைக் கண்டறிவதோ, மருந்துகளை பரிந்துரைப்பதோ அல்லது சான்றளிக்கப்பட்ட மருத்துவ தீர்ப்பை மாற்றுவதோ செய்யாது.';
