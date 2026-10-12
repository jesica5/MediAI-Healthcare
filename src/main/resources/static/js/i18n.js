/**
 * MediAI Bilingual Engine (English & Tamil)
 */

const MediI18N = {
  currentLang: localStorage.getItem('mediai_lang') || 'en',

  translations: {
    en: {
      appName: 'MediAI',
      appSubtitle: 'Smart Patient Triage & Emergency Risk Prediction System',
      nav: {
        home: 'Home',
        intake: 'Health Assessment',
        queue: 'Patient Queue',
        doctor: 'Doctor Workstation',
        analytics: 'Analytics',
        medications: 'Medications',
        profile: 'AI Risk & Explainability',
        signIn: 'Staff Login',
        signOut: 'Sign Out'
      },
      welcome: {
        heroBadge: 'AI-Powered Clinical Decision Support',
        heroTitle: 'Emergency Risk Prediction & Patient Triage',
        heroDesc: 'MediAI empowers healthcare providers with objective, evidence-based triage prioritization, TreeSHAP explainability, and multi-parameter vital signs safety monitoring.',
        btnIntake: 'Start Health Assessment',
        btnDoctor: 'Doctor Workstation',
        btnStaff: 'Staff Sign In',
        healthAssessmentTitle: 'Patient Health Assessment & Triage',
        healthAssessmentDesc: 'Patients and clinical staff can submit clinical symptoms, medical history, and vital signs for real-time acuity classification and emergency safety analysis.',
        featuresTitle: 'Core Capabilities',
        feat1Title: 'Bilingual Clinical Engine',
        feat1Desc: 'Native English and Tamil risk explanations designed to maximize patient comprehension and reassurance.',
        feat2Title: 'Data Protection & RLS',
        feat2Desc: 'AES-256 encrypted names, SHA-256 MRN identifiers, and strict row-level security for zero PHI leakage.',
        feat3Title: 'Clinical Safety Baselines',
        feat3Desc: 'Deterministic red flag boundaries prioritize acute resuscitation without autonomous treatment decisions.',
        disclaimer: 'Academic clinical decision-support prototype. It must never independently diagnose patients, prescribe medications, calculate dosages, or replace qualified medical professionals.'
      }
    },
    ta: {
      appName: 'MediAI',
      appSubtitle: 'நுண்ணறிவு நோயாளி மதிப்பீடு & அவசர இடர் கணிப்பு முறைமை',
      nav: {
        home: 'முகப்பு',
        intake: 'சுகாதார மதிப்பீடு',
        queue: 'நோயாளி வரிசை',
        doctor: 'மருத்துவர் பணிநிலையம்',
        analytics: 'பகுப்பாய்வு',
        medications: 'மருந்துகள்',
        profile: 'AI இடர் & விளக்கம்',
        signIn: 'ஊழியர் உள்நுழைவு',
        signOut: 'வெளியேறு'
      },
      welcome: {
        heroBadge: 'AI-ஆற்றல் வாய்ந்த மருத்துவ முடிவு ஆதரவு',
        heroTitle: 'அவசர இடர் கணிப்பு & நோயாளி மதிப்பீடு',
        heroDesc: 'MediAI மருத்துவ பணியாளர்களுக்கு துல்லியமான, சான்று அடிப்படையிலான வரிசை முன்னுரிமை, TreeSHAP விளக்கமளிக்கும் திறன் மற்றும் முக்கிய உடலியல் கண்காணிப்பை வழங்குகிறது.',
        btnIntake: 'சுகாதார மதிப்பீட்டைத் தொடங்கு',
        btnDoctor: 'மருத்துவர் பணிநிலையம்',
        btnStaff: 'ஊழியர் உள்நுழைவு',
        healthAssessmentTitle: 'நோயாளி சுகாதார மதிப்பீடு & வரிசைப்படுத்தல்',
        healthAssessmentDesc: 'நோயாளிகளும் ஊழியர்களும் அறிகுறிகள், மருத்துவ வரலாறு மற்றும் உடலியல் அளவீடுகளை சமர்ப்பித்து நேரடி அவசர இடர் ஆய்வைப் பெறலாம்.',
        featuresTitle: 'முக்கிய அம்சங்கள்',
        feat1Title: 'இருமொழி மருத்துவ தளம்',
        feat1Desc: 'நோயாளிகளின் தெளிவான புரிதலுக்காக ஆங்கிலம் மற்றும் தமிழ் மொழிகளில் எளிய மருத்துவ விளக்கங்கள்.',
        feat2Title: 'பாதுகாப்பு & மறைகுறியாக்கம்',
        feat2Desc: 'AES-256 மறைகுறியாக்கம் செய்யப்பட்ட பெயர்கள் மற்றும் SHA-256 அடையாளக்குறி பாதுகாப்புகள்.',
        feat3Title: 'மருத்துவ பாதுகாப்பு நெறிமுறைகள்',
        feat3Desc: 'அவசர முதலுதவித் தேவைகளைத் தானாகக் கண்டறியும் மருத்துவ பாதுகாப்பு எல்லைகள்.',
        disclaimer: 'கல்வி மருத்துவ முடிவு-ஆதரவு முன்மாதிரி மட்டுமே. இது நோய்களைக் கண்டறியவோ, மருந்து பரிந்துரைக்கவோ அல்லது தகுதி வாய்ந்த மருத்துவர்களுக்கு மாற்றாகவோ அமையாது.'
      }
    }
  },

  get(path) {
    const lang = this.currentLang;
    const parts = path.split('.');
    let curr = this.translations[lang] || this.translations.en;
    for (const p of parts) {
      if (curr && curr[p] !== undefined) {
        curr = curr[p];
      } else {
        return path;
      }
    }
    return curr;
  },

  setLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('mediai_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = this.get(key);
    });
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
      langBtn.textContent = lang === 'en' ? 'தமிழ்' : 'English';
    }
  },

  toggleLanguage() {
    this.setLanguage(this.currentLang === 'en' ? 'ta' : 'en');
  },

  init() {
    this.setLanguage(this.currentLang);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MediI18N.init();
});
