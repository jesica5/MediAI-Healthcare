'use client';

import React, { useState } from 'react';
import { SymptomVector, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import styles from './form.module.css';
import domainStyles from './SymptomChecklistStep.module.css';

interface Props {
  value: Partial<SymptomVector>;
  language: Language;
  onChange: (value: Partial<SymptomVector>) => void;
  onNext: () => void;
  onPrev: () => void;
}

type DomainKey = keyof Omit<SymptomVector, 'medical_history'>;

export function SymptomChecklistStep({ value, language, onChange, onNext, onPrev }: Props) {
  const t = getTranslation(language);
  const d = t.symptoms.domains;
  const [expanded, setExpanded] = useState<Set<DomainKey>>(new Set<DomainKey>(['cardiac', 'respiratory']));

  const toggle = (domain: DomainKey) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(domain) ? next.delete(domain) : next.add(domain);
      return next;
    });
  };

  const updateDomain = <K extends DomainKey>(domain: K, field: string, val: unknown) => {
    onChange({
      ...value,
      [domain]: {
        ...(value[domain] as Record<string, unknown> ?? {}),
        [field]: val,
      },
    });
  };

  const get = <K extends DomainKey>(domain: K, field: string): unknown => {
    return (value[domain] as Record<string, unknown>)?.[field];
  };

  const bool = (domain: DomainKey, field: string): boolean =>
    !!(value[domain] as Record<string, unknown>)?.[field];

  const BoolCheck = ({ domain, field, label }: { domain: DomainKey; field: string; label: string }) => (
    <label className={styles.checkboxField}>
      <input
        type="checkbox"
        checked={bool(domain, field)}
        onChange={(e) => updateDomain(domain, field, e.target.checked)}
      />
      <span className={styles.checkboxLabel}>{label}</span>
    </label>
  );

  const SelectField = ({
    domain, field, label, options
  }: { domain: DomainKey; field: string; label: string; options: Record<string, string> }) => (
    <div className={styles.field}>
      <label htmlFor={`${domain}-${field}`} className={styles.label}>{label}</label>
      <select
        id={`${domain}-${field}`}
        className={styles.select}
        value={(get(domain, field) as string) ?? ''}
        onChange={(e) => updateDomain(domain, field, e.target.value || undefined)}
      >
        <option value="">—</option>
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  );

  const domains: { key: DomainKey; title: string; content: React.ReactNode }[] = [
    {
      key: 'infection_sepsis',
      title: d.infection_sepsis.title,
      content: (
        <>
          <BoolCheck domain="infection_sepsis" field="altered_mentation" label={d.infection_sepsis.altered_mentation} />
          <BoolCheck domain="infection_sepsis" field="rigors" label={d.infection_sepsis.rigors} />
          <BoolCheck domain="infection_sepsis" field="diaphoresis" label={d.infection_sepsis.diaphoresis} />
        </>
      ),
    },
    {
      key: 'respiratory',
      title: d.respiratory.title,
      content: (
        <>
          <SelectField domain="respiratory" field="cough_character" label={d.respiratory.cough_character} options={d.respiratory.cough_options} />
          <BoolCheck domain="respiratory" field="accessory_muscle_use" label={d.respiratory.accessory_muscle_use} />
          <BoolCheck domain="respiratory" field="stridor" label={d.respiratory.stridor} />
        </>
      ),
    },
    {
      key: 'cardiac',
      title: d.cardiac.title,
      content: (
        <>
          <SelectField domain="cardiac" field="chest_pain_character" label={d.cardiac.chest_pain_character} options={d.cardiac.chest_pain_options} />
          <SelectField domain="cardiac" field="radiation" label={d.cardiac.radiation} options={d.cardiac.radiation_options} />
          <BoolCheck domain="cardiac" field="diaphoresis" label={d.cardiac.diaphoresis} />
          <BoolCheck domain="cardiac" field="palpitations" label={d.cardiac.palpitations} />
        </>
      ),
    },
    {
      key: 'neurological',
      title: d.neurological.title,
      content: (
        <>
          <BoolCheck domain="neurological" field="fast_facial_droop" label={d.neurological.fast_facial_droop} />
          <BoolCheck domain="neurological" field="fast_arm_drift" label={d.neurological.fast_arm_drift} />
          <BoolCheck domain="neurological" field="fast_speech_difficulty" label={d.neurological.fast_speech_difficulty} />
          <div className={styles.field}>
            <label htmlFor="gcs" className={styles.label}>{d.neurological.gcs_score}</label>
            <input id="gcs" type="number" className={styles.input} inputMode="numeric" min={3} max={15}
              value={(get('neurological', 'gcs_score') as number) ?? ''}
              onChange={(e) => updateDomain('neurological', 'gcs_score', e.target.value ? parseInt(e.target.value, 10) : null)} />
          </div>
          <SelectField domain="neurological" field="pupil_response" label={d.neurological.pupil_response} options={d.neurological.pupil_options} />
          <BoolCheck domain="neurological" field="seizures" label={d.neurological.seizures} />
        </>
      ),
    },
    {
      key: 'blood_pressure',
      title: d.blood_pressure.title,
      content: (
        <>
          <BoolCheck domain="blood_pressure" field="severe_headache" label={d.blood_pressure.severe_headache} />
          <BoolCheck domain="blood_pressure" field="chest_pain" label={d.blood_pressure.chest_pain} />
        </>
      ),
    },
    {
      key: 'diabetes',
      title: d.diabetes.title,
      content: (
        <>
          <BoolCheck domain="diabetes" field="kussmaul_breathing" label={d.diabetes.kussmaul_breathing} />
          <BoolCheck domain="diabetes" field="fruity_breath" label={d.diabetes.fruity_breath} />
        </>
      ),
    },
    {
      key: 'gastrointestinal',
      title: d.gastrointestinal.title,
      content: (
        <>
          <SelectField domain="gastrointestinal" field="pain_quadrant" label={d.gastrointestinal.pain_quadrant} options={d.gastrointestinal.quadrant_options} />
          <BoolCheck domain="gastrointestinal" field="rebound_tenderness" label={d.gastrointestinal.rebound_tenderness} />
          <SelectField domain="gastrointestinal" field="emesis" label={d.gastrointestinal.emesis} options={d.gastrointestinal.emesis_options} />
          <SelectField domain="gastrointestinal" field="stool_color" label={d.gastrointestinal.stool_color} options={d.gastrointestinal.stool_options} />
        </>
      ),
    },
    {
      key: 'injury_trauma',
      title: d.injury_trauma.title,
      content: (
        <>
          <SelectField domain="injury_trauma" field="mechanism" label={d.injury_trauma.mechanism} options={d.injury_trauma.mechanism_options} />
          <SelectField domain="injury_trauma" field="bleeding_rate" label={d.injury_trauma.bleeding_rate} options={d.injury_trauma.bleeding_options} />
          <BoolCheck domain="injury_trauma" field="deformity" label={d.injury_trauma.deformity} />
          <SelectField domain="injury_trauma" field="airway_patency" label={d.injury_trauma.airway_patency} options={d.injury_trauma.airway_options} />
        </>
      ),
    },
    {
      key: 'pregnancy',
      title: d.pregnancy.title,
      content: (
        <>
          <div className={styles.field}>
            <label htmlFor="gest-age" className={styles.label}>{d.pregnancy.gestational_age_weeks}</label>
            <input id="gest-age" type="number" className={styles.input} inputMode="numeric" min={1} max={45}
              value={(get('pregnancy', 'gestational_age_weeks') as number) ?? ''}
              onChange={(e) => updateDomain('pregnancy', 'gestational_age_weeks', e.target.value ? parseInt(e.target.value, 10) : null)} />
          </div>
          <BoolCheck domain="pregnancy" field="pelvic_pain" label={d.pregnancy.pelvic_pain} />
          <BoolCheck domain="pregnancy" field="vaginal_bleeding" label={d.pregnancy.vaginal_bleeding} />
          <BoolCheck domain="pregnancy" field="severe_headache" label={d.pregnancy.severe_headache} />
        </>
      ),
    },
    {
      key: 'allergic',
      title: d.allergic.title,
      content: (
        <>
          <BoolCheck domain="allergic" field="urticaria" label={d.allergic.urticaria} />
          <BoolCheck domain="allergic" field="mucosal_swelling" label={d.allergic.mucosal_swelling} />
          <BoolCheck domain="allergic" field="voice_change" label={d.allergic.voice_change} />
          <BoolCheck domain="allergic" field="wheeze" label={d.allergic.wheeze} />
        </>
      ),
    },
    {
      key: 'dehydration',
      title: d.dehydration.title,
      content: (
        <>
          <SelectField domain="dehydration" field="skin_turgor" label={d.dehydration.skin_turgor} options={d.dehydration.skin_turgor_options} />
          <SelectField domain="dehydration" field="mucous_membranes" label={d.dehydration.mucous_membranes} options={d.dehydration.mucous_options} />
          <SelectField domain="dehydration" field="urine_output" label={d.dehydration.urine_output} options={d.dehydration.urine_options} />
          <div className={styles.field}>
            <label htmlFor="cap-refill" className={styles.label}>{d.dehydration.capillary_refill_seconds}</label>
            <input id="cap-refill" type="number" className={styles.input} inputMode="decimal" min={0} max={15}
              value={(get('dehydration', 'capillary_refill_seconds') as number) ?? ''}
              onChange={(e) => updateDomain('dehydration', 'capillary_refill_seconds', e.target.value ? parseFloat(e.target.value) : null)} />
          </div>
        </>
      ),
    },
    {
      key: 'toxic_exposure',
      title: d.toxic_exposure.title,
      content: (
        <>
          <div className={styles.field}>
            <label htmlFor="substance" className={styles.label}>{d.toxic_exposure.substance_ingested}</label>
            <input id="substance" type="text" className={styles.input} maxLength={200}
              value={(get('toxic_exposure', 'substance_ingested') as string) ?? ''}
              onChange={(e) => updateDomain('toxic_exposure', 'substance_ingested', e.target.value || null)} />
          </div>
          <BoolCheck domain="toxic_exposure" field="puncture_marks" label={d.toxic_exposure.puncture_marks} />
          <SelectField domain="toxic_exposure" field="salivation" label={d.toxic_exposure.salivation} options={d.toxic_exposure.salivation_options} />
          <SelectField domain="toxic_exposure" field="pupil_size" label={d.toxic_exposure.pupil_size} options={d.toxic_exposure.pupil_size_options} />
        </>
      ),
    },
  ];

  return (
    <section aria-labelledby="symptoms-heading">
      <div className={styles.card}>
        <h2 id="symptoms-heading" className={styles.sectionTitle}>{t.symptoms.title}</h2>
        <p className={styles.sectionSubtitle}>{t.symptoms.subtitle}</p>

        <div className={domainStyles.domains}>
          {domains.map(({ key, title, content }) => (
            <div key={key} className={domainStyles.domain}>
              <button
                type="button"
                className={domainStyles.domainHeader}
                onClick={() => toggle(key)}
                aria-expanded={expanded.has(key)}
                aria-controls={`domain-${key}`}
              >
                <span>{title}</span>
                <span className={domainStyles.chevron} aria-hidden="true">
                  {expanded.has(key) ? '▲' : '▼'}
                </span>
              </button>
              <div
                id={`domain-${key}`}
                className={`${domainStyles.domainContent} ${expanded.has(key) ? domainStyles.open : ''}`}
                aria-hidden={!expanded.has(key)}
              >
                <div className={domainStyles.fields}>{content}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.navRow}>
          <button className={styles.secondaryBtn} onClick={onPrev}>← {t.common.previous}</button>
          <button className={styles.primaryBtn} onClick={onNext}>{t.common.next} →</button>
        </div>
      </div>
    </section>
  );
}
