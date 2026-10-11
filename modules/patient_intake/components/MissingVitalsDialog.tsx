'use client';

import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { getTranslation } from '../locales/i18n';
import styles from './MissingVitalsDialog.module.css';

interface Props {
  missingFields: string[];
  language: Language;
  onAcknowledge: () => void;
  onCancel: () => void;
}

const FIELD_LABEL_KEYS: Record<string, string> = {
  heart_rate: 'heartRate',
  systolic_bp: 'systolicBp',
  oxygen_saturation: 'oxygenSaturation',
  respiratory_rate: 'respiratoryRate',
  diastolic_bp: 'diastolicBp',
  temperature_celsius: 'temperature',
  capillary_blood_glucose: 'bloodGlucose',
};

export function MissingVitalsDialog({ missingFields, language, onAcknowledge, onCancel }: Props) {
  const t = getTranslation(language);
  const d = t.missingVitalsDialog;
  const v = t.vitals as Record<string, unknown>;
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const getFieldDisplayName = (field: string): string => {
    const key = FIELD_LABEL_KEYS[field];
    if (key && typeof v[key] === 'string') {
      return v[key] as string;
    }
    return field.replace(/_/g, ' ');
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
    >
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.iconWrapper} aria-hidden="true">
          ⚠️
        </div>
        <h2 id="dialog-title" className={styles.title}>
          {d.title}
        </h2>
        <p id="dialog-desc" className={styles.message}>
          {d.message}
        </p>

        {missingFields.length > 0 && (
          <>
            <div className={styles.missingListLabel}>{d.missingListLabel}</div>
            <ul className={styles.missingList}>
              {missingFields.map((field) => (
                <li key={field}>
                  <strong>{getFieldDisplayName(field)}</strong>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            autoFocus
          >
            {d.cancelButton}
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={onAcknowledge}
          >
            {d.confirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}
