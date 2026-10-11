'use client';

import React from 'react';
import { Demographics, MedicalHistory, SymptomVector, VitalsInput, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import formStyles from './form.module.css';
import reviewStyles from './ReviewStep.module.css';

interface FormState {
  demographics: Partial<Demographics>;
  symptoms: Partial<SymptomVector>;
  medicalHistory: Partial<MedicalHistory>;
  vitals: Partial<VitalsInput>;
}

interface Props {
  form: FormState;
  language: Language;
  missingEssentials: string[];
  onGoToStep: (step: 'intake' | 'symptoms' | 'history' | 'vitals' | 'review') => void;
  onSubmit: () => void;
  submitStatus: 'idle' | 'loading' | 'success' | 'error';
  submitError: string | null;
  onPrev: () => void;
}

export function ReviewStep({
  form,
  language,
  missingEssentials,
  onGoToStep,
  onSubmit,
  submitStatus,
  submitError,
  onPrev,
}: Props) {
  const t = getTranslation(language);
  const r = t.review;
  const v = t.vitals;
  const demo = form.demographics;
  const vit = form.vitals;
  const hist = form.medicalHistory;

  // Extract non-empty symptom labels
  const symptomFlags: string[] = [];
  if (form.symptoms) {
    Object.entries(form.symptoms).forEach(([domain, domainValues]) => {
      if (domain === 'medical_history') return;
      if (typeof domainValues === 'object' && domainValues !== null) {
        Object.entries(domainValues).forEach(([key, val]) => {
          if (val === true) {
            symptomFlags.push(`${domain}: ${key.replace(/_/g, ' ')}`);
          } else if (typeof val === 'string' && val !== 'none' && val !== '') {
            symptomFlags.push(`${domain}: ${key.replace(/_/g, ' ')} (${val})`);
          } else if (typeof val === 'number') {
            symptomFlags.push(`${domain}: ${key.replace(/_/g, ' ')} (${val})`);
          }
        });
      }
    });
  }

  const formatVital = (val: number | null | undefined, unit: string) => {
    return val !== null && val !== undefined ? `${val} ${unit}` : r.vitalsNotMeasured;
  };

  return (
    <section aria-labelledby="review-heading">
      <div className={formStyles.card}>
        <h2 id="review-heading" className={formStyles.sectionTitle}>
          {r.title}
        </h2>
        <p className={formStyles.sectionSubtitle}>{r.subtitle}</p>

        {submitError && (
          <div className={reviewStyles.errorBanner} role="alert">
            {submitError}
          </div>
        )}

        {missingEssentials.length > 0 && (
          <div className={reviewStyles.warningBox} role="alert">
            <span aria-hidden="true">⚠️</span>
            <p className={reviewStyles.warningText}>
              <strong>{r.essentialVitalsWarning}</strong> {v.warningMissingEssential}
            </p>
          </div>
        )}

        {/* 1. Demographics Section */}
        <div className={reviewStyles.summarySection}>
          <div className={reviewStyles.sectionHeader}>
            <h3 className={reviewStyles.sectionHeading}>{r.demographicsSummary}</h3>
            <button
              type="button"
              className={reviewStyles.editBtn}
              onClick={() => onGoToStep('intake')}
            >
              Edit
            </button>
          </div>
          <div className={reviewStyles.detailGrid}>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>Chief Complaint</div>
              <div className={reviewStyles.detailValue}>{demo.chief_complaint || '—'}</div>
            </div>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>Age / DOB</div>
              <div className={reviewStyles.detailValue}>
                {demo.age !== undefined && demo.age !== null
                  ? `${demo.age} yrs`
                  : demo.date_of_birth || '—'}
              </div>
            </div>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>Gender</div>
              <div className={reviewStyles.detailValue}>{demo.gender || '—'}</div>
            </div>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>Language</div>
              <div className={reviewStyles.detailValue}>{demo.primary_language?.toUpperCase() || 'EN'}</div>
            </div>
          </div>
        </div>

        {/* 2. Reported Symptoms */}
        <div className={reviewStyles.summarySection}>
          <div className={reviewStyles.sectionHeader}>
            <h3 className={reviewStyles.sectionHeading}>{r.symptomsSummary}</h3>
            <button
              type="button"
              className={reviewStyles.editBtn}
              onClick={() => onGoToStep('symptoms')}
            >
              Edit
            </button>
          </div>
          {symptomFlags.length > 0 ? (
            <ul className={reviewStyles.flagList}>
              {symptomFlags.map((flag, idx) => (
                <li key={idx} className={reviewStyles.flagBadge}>
                  {flag}
                </li>
              ))}
            </ul>
          ) : (
            <p className={reviewStyles.emptyNotice}>{r.noSymptomsReported}</p>
          )}
        </div>

        {/* 3. Medical History */}
        <div className={reviewStyles.summarySection}>
          <div className={reviewStyles.sectionHeader}>
            <h3 className={reviewStyles.sectionHeading}>{r.medicalHistorySummary}</h3>
            <button
              type="button"
              className={reviewStyles.editBtn}
              onClick={() => onGoToStep('history')}
            >
              Edit
            </button>
          </div>
          <div className={reviewStyles.detailGrid}>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>Immunosuppression</div>
              <div className={reviewStyles.detailValue}>
                {hist.immunosuppression ? 'Yes' : 'No'}
              </div>
            </div>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>Chronic Comorbidities</div>
              <div className={reviewStyles.detailValue}>
                {hist.severe_chronic_comorbidity ? 'Yes' : 'No'}
                {hist.comorbidity_note ? ` (${hist.comorbidity_note})` : ''}
              </div>
            </div>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>Pregnancy Status</div>
              <div className={reviewStyles.detailValue}>
                {hist.pregnancy_status?.replace(/_/g, ' ') || 'Not applicable'}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Vital Signs */}
        <div className={reviewStyles.summarySection}>
          <div className={reviewStyles.sectionHeader}>
            <h3 className={reviewStyles.sectionHeading}>{r.vitalsSummary}</h3>
            <button
              type="button"
              className={reviewStyles.editBtn}
              onClick={() => onGoToStep('vitals')}
            >
              Edit
            </button>
          </div>
          <div className={reviewStyles.detailGrid}>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>{v.heartRate}</div>
              <div className={reviewStyles.detailValue}>
                {formatVital(vit.heart_rate, v.units.bpm)}
              </div>
            </div>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>{v.systolicBp} / {v.diastolicBp}</div>
              <div className={reviewStyles.detailValue}>
                {vit.systolic_bp !== null && vit.systolic_bp !== undefined
                  ? `${vit.systolic_bp}/${vit.diastolic_bp ?? '—'} ${v.units.mmHg}`
                  : r.vitalsNotMeasured}
              </div>
            </div>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>{v.oxygenSaturation}</div>
              <div className={reviewStyles.detailValue}>
                {formatVital(vit.oxygen_saturation, v.units.percent)}
              </div>
            </div>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>{v.respiratoryRate}</div>
              <div className={reviewStyles.detailValue}>
                {formatVital(vit.respiratory_rate, v.units.breathsPerMin)}
              </div>
            </div>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>{v.temperature}</div>
              <div className={reviewStyles.detailValue}>
                {formatVital(vit.temperature_celsius, v.units.celsius)}
              </div>
            </div>
            <div className={reviewStyles.detailItem}>
              <div className={reviewStyles.detailLabel}>{v.bloodGlucose}</div>
              <div className={reviewStyles.detailValue}>
                {formatVital(vit.capillary_blood_glucose, v.units.mgDl)}
              </div>
            </div>
          </div>
        </div>

        <div className={formStyles.navRow}>
          <button
            type="button"
            className={formStyles.secondaryBtn}
            onClick={onPrev}
            disabled={submitStatus === 'loading'}
          >
            ← {t.common.previous}
          </button>
          <button
            type="button"
            className={formStyles.primaryBtn}
            onClick={onSubmit}
            disabled={submitStatus === 'loading'}
          >
            {submitStatus === 'loading' ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </div>
    </section>
  );
}
