'use client';

import React, { useState } from 'react';
import { Demographics, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import styles from './form.module.css';
import { VoiceInput } from './VoiceInput';

interface Props {
  value: Partial<Demographics>;
  language: Language;
  onChange: (value: Partial<Demographics>) => void;
  onNext: () => void;
}

export function DemographicStep({ value, language, onChange, onNext }: Props) {
  const t = getTranslation(language);
  const [errors, setErrors] = useState<Partial<Record<keyof Demographics, string>>>({});

  const update = <K extends keyof Demographics>(field: K, val: Demographics[K]) => {
    onChange({ ...value, [field]: val });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Demographics, string>> = {};
    if (!value.chief_complaint?.trim()) {
      newErrors.chief_complaint = t.demographics.chiefComplaintLabel + ' is required';
    } else if (value.chief_complaint.trim().length > 500) {
      newErrors.chief_complaint = 'Maximum 500 characters';
    }
    if (!value.gender) {
      newErrors.gender = t.demographics.genderLabel + ' is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <section aria-labelledby="demographics-heading">
      <div className={styles.card}>
        <h2 id="demographics-heading" className={styles.sectionTitle}>{t.demographics.title}</h2>
        <p className={styles.sectionSubtitle}>{t.demographics.subtitle}</p>

        <div className={styles.fieldGroup}>
          {/* Chief complaint with voice */}
          <div className={styles.field}>
            <label htmlFor="chief-complaint" className={styles.label}>
              {t.demographics.chiefComplaintLabel}
              <span className={styles.required} aria-label="required">*</span>
            </label>
            <textarea
              id="chief-complaint"
              className={styles.textarea}
              placeholder={t.demographics.chiefComplaintPlaceholder}
              value={value.chief_complaint ?? ''}
              onChange={(e) => update('chief_complaint', e.target.value)}
              maxLength={500}
              aria-describedby="complaint-hint complaint-error"
              aria-invalid={!!errors.chief_complaint}
              rows={3}
            />
            <span id="complaint-hint" className={styles.hint}>{t.demographics.chiefComplaintHelper}</span>
            {errors.chief_complaint && (
              <span id="complaint-error" className={styles.error} role="alert">{errors.chief_complaint}</span>
            )}
            <VoiceInput
              language={language}
              onTranscript={(text) => update('chief_complaint', text)}
            />
          </div>

          <div className={styles.row}>
            {/* Date of Birth */}
            <div className={styles.field}>
              <label htmlFor="dob" className={styles.label}>{t.demographics.dobLabel}</label>
              <input
                id="dob"
                type="date"
                className={styles.input}
                value={value.date_of_birth ?? ''}
                onChange={(e) => update('date_of_birth', e.target.value || null)}
              />
            </div>

            {/* Age fallback */}
            <div className={styles.field}>
              <label htmlFor="age" className={styles.label}>{t.demographics.ageLabel}</label>
              <input
                id="age"
                type="number"
                className={styles.input}
                placeholder="—"
                inputMode="numeric"
                min={0}
                max={130}
                value={value.age ?? ''}
                onChange={(e) => update('age', e.target.value ? parseInt(e.target.value, 10) : null)}
              />
            </div>
          </div>

          {/* Gender */}
          <div className={styles.field}>
            <label htmlFor="gender" className={styles.label}>
              {t.demographics.genderLabel}
              <span className={styles.required} aria-label="required">*</span>
            </label>
            <select
              id="gender"
              className={styles.select}
              value={value.gender ?? ''}
              onChange={(e) => update('gender', e.target.value as Demographics['gender'])}
              aria-invalid={!!errors.gender}
              aria-describedby={errors.gender ? 'gender-error' : undefined}
            >
              <option value="">—</option>
              <option value="female">{t.demographics.genderOptions.female}</option>
              <option value="male">{t.demographics.genderOptions.male}</option>
              <option value="other">{t.demographics.genderOptions.other}</option>
              <option value="prefer_not_to_say">{t.demographics.genderOptions.prefer_not_to_say}</option>
            </select>
            {errors.gender && (
              <span id="gender-error" className={styles.error} role="alert">{errors.gender}</span>
            )}
          </div>
        </div>

        <div className={styles.navRow}>
          <div />
          <button className={styles.primaryBtn} onClick={handleNext}>
            {t.common.next} →
          </button>
        </div>
      </div>
    </section>
  );
}
