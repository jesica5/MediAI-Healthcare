'use client';

import '../../modules/patient_intake/styles/tokens.css';
import React, { useState, useCallback } from 'react';
import { VitalsInput, Demographics, MedicalHistory, SymptomVector, Language } from '../../modules/patient_intake/types';
import { getMissingEssentialVitals } from '../../modules/patient_intake/schemas/vitals.schema';
import { StepProgress } from '../../modules/patient_intake/components/StepProgress';
import { DemographicStep } from '../../modules/patient_intake/components/DemographicStep';
import { SymptomChecklistStep } from '../../modules/patient_intake/components/SymptomChecklistStep';
import { MedicalHistoryStep } from '../../modules/patient_intake/components/MedicalHistoryStep';
import { VitalsStep } from '../../modules/patient_intake/components/VitalsStep';
import { ReviewStep } from '../../modules/patient_intake/components/ReviewStep';
import { MissingVitalsDialog } from '../../modules/patient_intake/components/MissingVitalsDialog';
import { getTranslation } from '../../modules/patient_intake/locales/i18n';
import { useLanguage } from '@/shared/context/LanguageContext';
import styles from './intake.module.css';

const STEPS = ['intake', 'symptoms', 'history', 'vitals', 'review'] as const;
type Step = (typeof STEPS)[number];

interface FormState {
  demographics: Partial<Demographics>;
  symptoms: Partial<SymptomVector>;
  medicalHistory: Partial<MedicalHistory>;
  vitals: Partial<VitalsInput>;
}

const emptyForm: FormState = {
  demographics: { primary_language: 'en' },
  symptoms: {},
  medicalHistory: { immunosuppression: false, severe_chronic_comorbidity: false, comorbidity_note: null },
  vitals: {},
};

export default function IntakePage() {
  const { language: globalLanguage, setLanguage: setGlobalLanguage } = useLanguage();
  const [step, setStep] = useState<Step>('intake');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [language, setLanguage] = useState<Language>(globalLanguage || 'en');
  const [showMissingVitalsDialog, setShowMissingVitalsDialog] = useState(false);
  const [missingVitalsAcknowledged, setMissingVitalsAcknowledged] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  const t = getTranslation(language);

  const currentStepIndex = STEPS.indexOf(step);
  const missingEssentials = getMissingEssentialVitals(form.vitals as Record<string, number | null | undefined>);

  // Keep language in sync with global header toggle
  React.useEffect(() => {
    if (globalLanguage && globalLanguage !== language) {
      setLanguage(globalLanguage);
      setForm(prev => ({
        ...prev,
        demographics: { ...prev.demographics, primary_language: globalLanguage },
      }));
    }
  }, [globalLanguage, language]);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    setGlobalLanguage(lang);
    setForm(prev => ({
      ...prev,
      demographics: { ...prev.demographics, primary_language: lang },
    }));
  }, [setGlobalLanguage]);

  const goNext = useCallback(() => {
    const next = STEPS[currentStepIndex + 1];
    if (next) setStep(next);
  }, [currentStepIndex]);

  const goPrev = useCallback(() => {
    const prev = STEPS[currentStepIndex - 1];
    if (prev) setStep(prev);
  }, [currentStepIndex]);

  const goToStep = useCallback((target: Step) => {
    setStep(target);
  }, []);

  const handleSubmit = useCallback(async () => {
    // If essential vitals are missing and not yet acknowledged, show the dialog
    if (missingEssentials.length > 0 && !missingVitalsAcknowledged) {
      setShowMissingVitalsDialog(true);
      return;
    }

    setSubmitStatus('loading');
    setSubmitError(null);

    const payload = {
      patient_id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-000000000000',
      chief_complaint: form.demographics.chief_complaint ?? '',
      symptom_vector: { ...form.symptoms, medical_history: form.medicalHistory },
      vitals: {
        heart_rate: form.vitals.heart_rate ?? null,
        respiratory_rate: form.vitals.respiratory_rate ?? null,
        systolic_bp: form.vitals.systolic_bp ?? null,
        diastolic_bp: form.vitals.diastolic_bp ?? null,
        oxygen_saturation: form.vitals.oxygen_saturation ?? null,
        temperature_celsius: form.vitals.temperature_celsius ?? null,
        capillary_blood_glucose: form.vitals.capillary_blood_glucose ?? null,
      },
      missing_essential_vitals: missingEssentials,
      medical_history: form.medicalHistory,
      language,
    };

    try {
      const res = await fetch('/api/v1/triage/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSubmitStatus('error');
        setSubmitError(data.error?.message ?? 'Submission failed. Please try again.');
        return;
      }
      setAssessmentResult(data.data);
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
      setSubmitError('Network error. Your information has been preserved. Please try again.');
    }
  }, [form, language, missingEssentials, missingVitalsAcknowledged]);

  if (submitStatus === 'success') {
    const category = assessmentResult?.calculated_category || 'PENDING';
    const score = assessmentResult?.calculated_risk_score ?? '--';
    const isRedFlag = assessmentResult?.hard_red_flag_triggered;

    return (
      <div className={`${styles.main} m2Root`}>
        <div className={styles.successCard} role="status">
          <div className={styles.successIcon}>✓</div>
          <h1>Assessment Submitted & Triaged</h1>
          <p>Your health assessment has been processed through the MediAI Triage Safety Engine.</p>

          <div style={{ marginTop: '1rem', marginBottom: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.04)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Assigned Triage Acuity:</span>
              <span style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                backgroundColor: category === 'CRITICAL' ? '#E53E3E' : category === 'HIGH' ? '#ED8936' : category === 'MODERATE' ? '#ECC94B' : '#38A169'
              }}>
                {category} (Score: {score}/100)
              </span>
            </div>

            {isRedFlag && (
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(229, 62, 62, 0.1)', color: '#c53030', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                ⚠️ Tier-1 Clinical Red Flag Detected. Escalated to Priority 1 (Immediate Medical Evaluation).
              </div>
            )}

            {assessmentResult?.risk_explanation?.summary && (
              <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0' }}>
                <strong>Clinical Summary:</strong> {assessmentResult.risk_explanation.summary}
              </p>
            )}
          </div>

          <p className={styles.disclaimer}>{t.common.disclaimer}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className={styles.primaryButton}
              onClick={() => { setForm(emptyForm); setStep('intake'); setSubmitStatus('idle'); setMissingVitalsAcknowledged(false); setAssessmentResult(null); }}
            >
              Start New Assessment
            </button>
            <a
              href="/doctor/queue"
              className={styles.primaryButton}
              style={{ background: '#0f172a', textDecoration: 'none', display: 'inline-block' }}
            >
              View in Doctor Queue →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.main} m2Root`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Health Assessment</h1>
        <div className={styles.langSwitch}>
          <button
            className={language === 'en' ? styles.langActive : styles.langBtn}
            onClick={() => handleLanguageChange('en')}
            aria-pressed={language === 'en'}
          >EN</button>
          <button
            className={language === 'ta' ? styles.langActive : styles.langBtn}
            onClick={() => handleLanguageChange('ta')}
            aria-pressed={language === 'ta'}
          >தமிழ்</button>
        </div>
      </div>

      <StepProgress steps={STEPS} currentStep={step} language={language} />

      <div className={styles.content}>
        {step === 'intake' && (
          <DemographicStep
            value={form.demographics}
            language={language}
            onChange={(demographics) => setForm(prev => ({ ...prev, demographics }))}
            onNext={goNext}
          />
        )}

        {step === 'symptoms' && (
          <SymptomChecklistStep
            value={form.symptoms}
            language={language}
            onChange={(symptoms) => setForm(prev => ({ ...prev, symptoms }))}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}

        {step === 'history' && (
          <MedicalHistoryStep
            value={form.medicalHistory}
            language={language}
            onChange={(medicalHistory) => setForm(prev => ({ ...prev, medicalHistory }))}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}

        {step === 'vitals' && (
          <VitalsStep
            value={form.vitals}
            language={language}
            onChange={(vitals) => setForm(prev => ({ ...prev, vitals }))}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}

        {step === 'review' && (
          <ReviewStep
            form={form}
            language={language}
            missingEssentials={missingEssentials}
            onGoToStep={goToStep}
            onSubmit={handleSubmit}
            submitStatus={submitStatus}
            submitError={submitError}
            onPrev={goPrev}
          />
        )}
      </div>

      {showMissingVitalsDialog && (
        <MissingVitalsDialog
          missingFields={missingEssentials}
          language={language}
          onAcknowledge={() => {
            setMissingVitalsAcknowledged(true);
            setShowMissingVitalsDialog(false);
            handleSubmit();
          }}
          onCancel={() => {
            setShowMissingVitalsDialog(false);
            setStep('vitals');
          }}
        />
      )}

      <footer className={styles.disclaimer}>
        {t.common.disclaimer}
      </footer>
    </div>
  );
}
