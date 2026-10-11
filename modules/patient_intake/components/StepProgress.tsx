import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../locales/i18n';
import styles from './StepProgress.module.css';

const STEP_KEYS = ['intake', 'symptoms', 'history', 'vitals', 'review'] as const;
type Step = (typeof STEP_KEYS)[number];

interface Props {
  steps: readonly Step[];
  currentStep: Step;
  language: Language;
}

export function StepProgress({ steps, currentStep, language }: Props) {
  const t = getTranslation(language);
  const currentIndex = steps.indexOf(currentStep);

  const labels: Record<Step, string> = {
    intake: t.steps.demographics,
    symptoms: t.steps.symptoms,
    history: t.steps.medicalHistory,
    vitals: t.steps.vitals,
    review: t.steps.review,
  };

  return (
    <nav aria-label="Assessment progress" className={styles.progress}>
      <ol className={styles.list}>
        {steps.map((s, i) => {
          const isDone = i < currentIndex;
          const isCurrent = s === currentStep;
          return (
            <li
              key={s}
              className={`${styles.step} ${isDone ? styles.done : ''} ${isCurrent ? styles.current : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className={styles.indicator}>{isDone ? '✓' : i + 1}</span>
              <span className={styles.label}>{labels[s]}</span>
              {i < steps.length - 1 && <span className={styles.connector} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
      <div className={styles.barContainer}>
        <div
          className={styles.barFill}
          style={{ width: `${((currentIndex) / (steps.length - 1)) * 100}%` }}
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label={`Step ${currentIndex + 1} of ${steps.length}`}
        />
      </div>
    </nav>
  );
}
