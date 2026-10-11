'use client';

import React from 'react';
import { MedicalHistory, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import styles from './form.module.css';

interface Props {
  value: Partial<MedicalHistory>;
  language: Language;
  onChange: (value: Partial<MedicalHistory>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MedicalHistoryStep({ value, language, onChange, onNext, onPrev }: Props) {
  const t = getTranslation(language);
  const m = t.medicalHistory;

  const update = <K extends keyof MedicalHistory>(field: K, val: MedicalHistory[K]) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <section aria-labelledby="history-heading">
      <div className={styles.card}>
        <h2 id="history-heading" className={styles.sectionTitle}>{m.title}</h2>
        <p className={styles.sectionSubtitle}>{m.subtitle}</p>

        <div className={styles.fieldGroup}>
          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={value.immunosuppression ?? false}
              onChange={(e) => update('immunosuppression', e.target.checked)}
              aria-describedby="immunosuppression-hint"
            />
            <span className={styles.checkboxLabel}>
              <strong>{m.immunosuppressionLabel}</strong>
            </span>
          </label>

          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              checked={value.severe_chronic_comorbidity ?? false}
              onChange={(e) => update('severe_chronic_comorbidity', e.target.checked)}
              aria-describedby="comorbidity-hint"
            />
            <span className={styles.checkboxLabel}>
              <strong>{m.chronicComorbidityLabel}</strong>
            </span>
          </label>

          {value.severe_chronic_comorbidity && (
            <div className={styles.field}>
              <label htmlFor="comorbidity-note" className={styles.label}>{m.comorbidityNoteLabel}</label>
              <textarea
                id="comorbidity-note"
                className={styles.textarea}
                placeholder={m.comorbidityNotePlaceholder}
                value={value.comorbidity_note ?? ''}
                onChange={(e) => update('comorbidity_note', e.target.value || null)}
                rows={2}
                maxLength={300}
              />
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="pregnancy-status" className={styles.label}>{m.pregnancyStatusLabel}</label>
            <select
              id="pregnancy-status"
              className={styles.select}
              value={value.pregnancy_status ?? 'not_applicable'}
              onChange={(e) => update('pregnancy_status', e.target.value as MedicalHistory['pregnancy_status'])}
            >
              <option value="not_applicable">{m.pregnancyOptions.not_applicable}</option>
              <option value="not_pregnant">{m.pregnancyOptions.not_pregnant}</option>
              <option value="pregnant">{m.pregnancyOptions.pregnant}</option>
              <option value="unknown">{m.pregnancyOptions.unknown}</option>
            </select>
          </div>
        </div>

        <div className={styles.navRow}>
          <button className={styles.secondaryBtn} onClick={onPrev}>← {t.common.previous}</button>
          <button className={styles.primaryBtn} onClick={onNext}>{t.common.next} →</button>
        </div>
      </div>
    </section>
  );
}
