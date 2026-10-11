'use client';

import React, { useState } from 'react';
import { VitalsInput, Language } from '../types';
import { vitalsInputSchema, getMissingEssentialVitals } from '../schemas/vitals.schema';
import { getTranslation } from '../locales/i18n';
import styles from './form.module.css';

interface Props {
  value: Partial<VitalsInput>;
  language: Language;
  onChange: (value: Partial<VitalsInput>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function VitalsStep({ value, language, onChange, onNext, onPrev }: Props) {
  const t = getTranslation(language);
  const v = t.vitals;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof VitalsInput, rawVal: string) => {
    const val = rawVal.trim() === '' ? null : Number(rawVal);
    const updated = { ...value, [field]: val };
    onChange(updated);

    // Clear error for field on edit
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNext = () => {
    // Validate with vitalsInputSchema
    const parsed = vitalsInputSchema.safeParse({
      heart_rate: value.heart_rate ?? null,
      respiratory_rate: value.respiratory_rate ?? null,
      systolic_bp: value.systolic_bp ?? null,
      diastolic_bp: value.diastolic_bp ?? null,
      oxygen_saturation: value.oxygen_saturation ?? null,
      temperature_celsius: value.temperature_celsius ?? null,
      capillary_blood_glucose: value.capillary_blood_glucose ?? null,
    });

    if (!parsed.success) {
      const errMap: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0] as string;
        if (fieldName && !errMap[fieldName]) {
          errMap[fieldName] = issue.message;
        }
      }
      setErrors(errMap);
      return;
    }

    setErrors({});
    onNext();
  };

  const missingEssentials = getMissingEssentialVitals(value as Record<string, number | null | undefined>);

  return (
    <section aria-labelledby="vitals-heading">
      <div className={styles.card}>
        <h2 id="vitals-heading" className={styles.sectionTitle}>{v.title}</h2>
        <p className={styles.sectionSubtitle}>{v.subtitle}</p>

        {missingEssentials.length > 0 && (
          <div className={styles.warningBanner} role="status">
            <span aria-hidden="true">⚠️</span>
            <span>{v.warningMissingEssential}</span>
          </div>
        )}

        <div className={styles.fieldGroup} style={{ marginTop: 'var(--spacing-4)' }}>
          {/* Heart rate & Respiratory rate */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="vital-hr" className={styles.label}>
                {v.heartRate} <span className={styles.unitBadge}>{v.units.bpm}</span>
              </label>
              <input
                id="vital-hr"
                type="number"
                inputMode="numeric"
                className={styles.input}
                placeholder="e.g. 75"
                value={value.heart_rate ?? ''}
                onChange={(e) => updateField('heart_rate', e.target.value)}
                aria-invalid={!!errors.heart_rate}
                aria-describedby="hr-hint hr-error"
              />
              <span id="hr-hint" className={styles.rangeHint}>{v.ranges.heartRate}</span>
              {errors.heart_rate && <span id="hr-error" className={styles.error} role="alert">{errors.heart_rate}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="vital-rr" className={styles.label}>
                {v.respiratoryRate} <span className={styles.unitBadge}>{v.units.breathsPerMin}</span>
              </label>
              <input
                id="vital-rr"
                type="number"
                inputMode="numeric"
                className={styles.input}
                placeholder="e.g. 16"
                value={value.respiratory_rate ?? ''}
                onChange={(e) => updateField('respiratory_rate', e.target.value)}
                aria-invalid={!!errors.respiratory_rate}
                aria-describedby="rr-hint rr-error"
              />
              <span id="rr-hint" className={styles.rangeHint}>{v.ranges.respiratoryRate}</span>
              {errors.respiratory_rate && <span id="rr-error" className={styles.error} role="alert">{errors.respiratory_rate}</span>}
            </div>
          </div>

          {/* Blood pressure: SBP & DBP */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="vital-sbp" className={styles.label}>
                {v.systolicBp} <span className={styles.unitBadge}>{v.units.mmHg}</span>
              </label>
              <input
                id="vital-sbp"
                type="number"
                inputMode="numeric"
                className={styles.input}
                placeholder="e.g. 120"
                value={value.systolic_bp ?? ''}
                onChange={(e) => updateField('systolic_bp', e.target.value)}
                aria-invalid={!!errors.systolic_bp}
                aria-describedby="sbp-hint sbp-error"
              />
              <span id="sbp-hint" className={styles.rangeHint}>{v.ranges.systolicBp}</span>
              {errors.systolic_bp && <span id="sbp-error" className={styles.error} role="alert">{errors.systolic_bp}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="vital-dbp" className={styles.label}>
                {v.diastolicBp} <span className={styles.unitBadge}>{v.units.mmHg}</span>
              </label>
              <input
                id="vital-dbp"
                type="number"
                inputMode="numeric"
                className={styles.input}
                placeholder="e.g. 80"
                value={value.diastolic_bp ?? ''}
                onChange={(e) => updateField('diastolic_bp', e.target.value)}
                aria-invalid={!!errors.diastolic_bp}
                aria-describedby="dbp-hint dbp-error"
              />
              <span id="dbp-hint" className={styles.rangeHint}>{v.ranges.diastolicBp}</span>
              {errors.diastolic_bp && <span id="dbp-error" className={styles.error} role="alert">{errors.diastolic_bp}</span>}
            </div>
          </div>

          {/* SpO2 & Temperature */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="vital-spo2" className={styles.label}>
                {v.oxygenSaturation} <span className={styles.unitBadge}>{v.units.percent}</span>
              </label>
              <input
                id="vital-spo2"
                type="number"
                step="0.1"
                inputMode="decimal"
                className={styles.input}
                placeholder="e.g. 98.0"
                value={value.oxygen_saturation ?? ''}
                onChange={(e) => updateField('oxygen_saturation', e.target.value)}
                aria-invalid={!!errors.oxygen_saturation}
                aria-describedby="spo2-hint spo2-error"
              />
              <span id="spo2-hint" className={styles.rangeHint}>{v.ranges.oxygenSaturation}</span>
              {errors.oxygen_saturation && <span id="spo2-error" className={styles.error} role="alert">{errors.oxygen_saturation}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="vital-temp" className={styles.label}>
                {v.temperature} <span className={styles.unitBadge}>{v.units.celsius}</span>
              </label>
              <input
                id="vital-temp"
                type="number"
                step="0.01"
                inputMode="decimal"
                className={styles.input}
                placeholder="e.g. 37.00"
                value={value.temperature_celsius ?? ''}
                onChange={(e) => updateField('temperature_celsius', e.target.value)}
                aria-invalid={!!errors.temperature_celsius}
                aria-describedby="temp-hint temp-error"
              />
              <span id="temp-hint" className={styles.rangeHint}>{v.ranges.temperature}</span>
              {errors.temperature_celsius && <span id="temp-error" className={styles.error} role="alert">{errors.temperature_celsius}</span>}
            </div>
          </div>

          {/* Blood Glucose */}
          <div className={styles.field}>
            <label htmlFor="vital-glucose" className={styles.label}>
              {v.bloodGlucose} <span className={styles.unitBadge}>{v.units.mgDl}</span>
            </label>
            <input
              id="vital-glucose"
              type="number"
              step="0.1"
              inputMode="decimal"
              className={styles.input}
              placeholder="e.g. 110.0"
              value={value.capillary_blood_glucose ?? ''}
              onChange={(e) => updateField('capillary_blood_glucose', e.target.value)}
              aria-invalid={!!errors.capillary_blood_glucose}
              aria-describedby="glucose-hint glucose-error"
            />
            <span id="glucose-hint" className={styles.rangeHint}>{v.ranges.bloodGlucose}</span>
            {errors.capillary_blood_glucose && <span id="glucose-error" className={styles.error} role="alert">{errors.capillary_blood_glucose}</span>}
          </div>
        </div>

        <div className={styles.navRow}>
          <button type="button" className={styles.secondaryBtn} onClick={onPrev}>
            ← {t.common.previous}
          </button>
          <button type="button" className={styles.primaryBtn} onClick={handleNext}>
            {t.common.next} →
          </button>
        </div>
      </div>
    </section>
  );
}
