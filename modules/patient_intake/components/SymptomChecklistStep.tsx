'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { SymptomVector, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import {
  CLINICAL_DOMAINS,
  DomainKey,
  DomainDefinition,
  SymptomCheckboxDef,
  SymptomSelectDef,
  SymptomNumberDef,
  SymptomTextDef,
} from '../constants/symptoms';
import formStyles from './form.module.css';
import domainStyles from './SymptomChecklistStep.module.css';

interface Props {
  value: Partial<SymptomVector>;
  language: Language;
  onChange: (value: Partial<SymptomVector>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function SymptomChecklistStep({ value, language, onChange, onNext, onPrev }: Props) {
  const t = getTranslation(language);
  const isTamil = language === 'ta';

  // Track expanded accordions (default open: Infection & Sepsis and Respiratory)
  const [expanded, setExpanded] = useState<Set<DomainKey>>(
    new Set<DomainKey>(['infection_sepsis', 'respiratory'])
  );

  // Clear confirmation modal state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Accordion toggle
  const toggleDomain = useCallback((domain: DomainKey) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(new Set<DomainKey>(CLINICAL_DOMAINS.map((d) => d.key)));
  }, []);

  const collapseAll = useCallback(() => {
    setExpanded(new Set<DomainKey>());
  }, []);

  // Update a field inside a domain
  const updateDomainField = useCallback(
    <K extends DomainKey>(domain: K, field: string, val: unknown) => {
      const currentDomainData = (value[domain] as Record<string, unknown>) ?? {};
      const updatedDomainData = { ...currentDomainData, [field]: val };

      // If value is undefined or false, keep clean state
      if (val === undefined) {
        delete updatedDomainData[field];
      }

      onChange({
        ...value,
        [domain]: updatedDomainData,
      });
    },
    [value, onChange]
  );

  // Retrieve field value
  const getFieldVal = useCallback(
    <K extends DomainKey>(domain: K, field: string): unknown => {
      return (value[domain] as Record<string, unknown>)?.[field];
    },
    [value]
  );

  const isChecked = useCallback(
    (domain: DomainKey, field: string): boolean => {
      return !!getFieldVal(domain, field);
    },
    [getFieldVal]
  );

  // Count active selections for a single domain
  const getDomainSelectedCount = useCallback(
    (domainDef: DomainDefinition): number => {
      let count = 0;
      domainDef.checkboxes.forEach((cb) => {
        if (isChecked(domainDef.key, cb.id)) count++;
      });
      if (domainDef.selects) {
        domainDef.selects.forEach((sel) => {
          const val = getFieldVal(domainDef.key, sel.id);
          if (typeof val === 'string' && val !== '' && val !== 'none') count++;
        });
      }
      if (domainDef.numbers) {
        domainDef.numbers.forEach((num) => {
          const val = getFieldVal(domainDef.key, num.id);
          if (typeof val === 'number' && !isNaN(val)) count++;
        });
      }
      if (domainDef.texts) {
        domainDef.texts.forEach((txt) => {
          const val = getFieldVal(domainDef.key, txt.id);
          if (typeof val === 'string' && val.trim().length > 0) count++;
        });
      }
      return count;
    },
    [isChecked, getFieldVal]
  );

  // Total selected symptoms across all domains
  const totalSelectedCount = useMemo(() => {
    return CLINICAL_DOMAINS.reduce((sum, d) => sum + getDomainSelectedCount(d), 0);
  }, [getDomainSelectedCount]);

  // Clear all selections handler
  const handleClearAll = useCallback(() => {
    // Preserve medical_history if carried inside symptom_vector
    const preservedHistory = value.medical_history;
    onChange(preservedHistory ? { medical_history: preservedHistory } : {});
    setShowClearConfirm(false);
  }, [value, onChange]);

  return (
    <section aria-labelledby="symptoms-heading" className={domainStyles.container}>
      <div className={formStyles.card}>
        {/* Title and subtitle */}
        <h2 id="symptoms-heading" className={formStyles.sectionTitle}>
          {t.symptoms?.title || 'Clinical Symptoms Checklist'}
        </h2>
        <p className={formStyles.sectionSubtitle}>
          {t.symptoms?.subtitle ||
            'Check all symptoms observed or reported across 12 clinical domains.'}
        </p>

        {/* Toolbar & Status Bar */}
        <div className={domainStyles.toolbar}>
          <div className={domainStyles.countGroup}>
            <span className={domainStyles.countBadge}>
              <span className={domainStyles.countDot} aria-hidden="true" />
              <span>
                {totalSelectedCount}{' '}
                {isTamil ? 'அறிகுறிகள் தேர்ந்தெடுக்கப்பட்டன' : 'Symptoms Selected'}
              </span>
            </span>
          </div>

          <div className={domainStyles.toolbarActions}>
            <button
              type="button"
              className={domainStyles.textBtn}
              onClick={expandAll}
              title="Expand all 12 domains"
            >
              {isTamil ? 'அனைத்தையும் விரி' : 'Expand All'}
            </button>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <button
              type="button"
              className={domainStyles.textBtn}
              onClick={collapseAll}
              title="Collapse all 12 domains"
            >
              {isTamil ? 'அனைத்தையும் சுருக்கு' : 'Collapse All'}
            </button>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <button
              type="button"
              className={domainStyles.clearBtn}
              disabled={totalSelectedCount === 0}
              onClick={() => setShowClearConfirm(true)}
              aria-label="Clear all symptom selections"
            >
              {isTamil ? 'அனைத்தையும் நீக்கு' : 'Clear Selections'}
            </button>
          </div>
        </div>

        {/* 12 Expandable Accordion Sections */}
        <div className={domainStyles.domains}>
          {CLINICAL_DOMAINS.map((domainDef) => {
            const isOpen = expanded.has(domainDef.key);
            const domainCount = getDomainSelectedCount(domainDef);
            const domainTitle = isTamil ? domainDef.titleTa : domainDef.titleEn;
            const domainDesc = isTamil ? domainDef.descriptionTa : domainDef.descriptionEn;

            return (
              <div
                key={domainDef.key}
                className={`${domainStyles.domain} ${domainCount > 0 ? domainStyles.domainActive : ''}`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  className={domainStyles.domainHeader}
                  onClick={() => toggleDomain(domainDef.key)}
                  aria-expanded={isOpen}
                  aria-controls={`domain-content-${domainDef.key}`}
                  id={`domain-header-${domainDef.key}`}
                >
                  <div className={domainStyles.headerLeft}>
                    <span className={domainStyles.headerTitle}>{domainTitle}</span>
                  </div>

                  <div className={domainStyles.headerRight}>
                    {domainCount > 0 && (
                      <span className={domainStyles.domainBadge}>
                        {domainCount} {isTamil ? 'தேர்வு' : 'selected'}
                      </span>
                    )}
                    <span
                      className={`${domainStyles.chevron} ${isOpen ? domainStyles.chevronOpen : ''}`}
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  </div>
                </button>

                {/* Accordion Body */}
                <div
                  id={`domain-content-${domainDef.key}`}
                  role="region"
                  aria-labelledby={`domain-header-${domainDef.key}`}
                  className={`${domainStyles.domainContent} ${isOpen ? domainStyles.open : ''}`}
                  aria-hidden={!isOpen}
                >
                  <div className={domainStyles.fields}>
                    <p className={domainStyles.domainDesc}>{domainDesc}</p>

                    {/* Checkbox Grid */}
                    <div className={domainStyles.checkboxGrid}>
                      {domainDef.checkboxes.map((cb: SymptomCheckboxDef) => {
                        const checked = isChecked(domainDef.key, cb.id);
                        const labelText = isTamil ? cb.labelTa : cb.labelEn;

                        return (
                          <label
                            key={cb.id}
                            htmlFor={`${domainDef.key}-${cb.id}`}
                            className={`${domainStyles.symptomCard} ${checked ? domainStyles.symptomCardChecked : ''}`}
                          >
                            <input
                              id={`${domainDef.key}-${cb.id}`}
                              type="checkbox"
                              className={domainStyles.checkboxInput}
                              checked={checked}
                              onChange={(e) =>
                                updateDomainField(domainDef.key, cb.id, e.target.checked)
                              }
                            />
                            <div className={domainStyles.symptomTextCol}>
                              <span className={domainStyles.symptomLabel}>{labelText}</span>
                              {cb.isRedFlag && (
                                <span className={domainStyles.redFlagPill}>
                                  🚨 {isTamil ? 'அபாய அறிகுறி' : 'Red Flag'}
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Structured Measurements / Parameters (if present) */}
                    {(domainDef.selects || domainDef.numbers || domainDef.texts) && (
                      <div className={domainStyles.paramSection}>
                        <h4 className={domainStyles.paramSectionTitle}>
                          {isTamil ? 'மருத்துவ விவரங்கள் & அளவுருக்கள்' : 'Clinical Parameters & Details'}
                        </h4>
                        <div className={domainStyles.paramGrid}>
                          {/* Dropdowns */}
                          {domainDef.selects?.map((sel: SymptomSelectDef) => (
                            <div key={sel.id} className={formStyles.field}>
                              <label htmlFor={`${domainDef.key}-${sel.id}`} className={formStyles.label}>
                                {isTamil ? sel.labelTa : sel.labelEn}
                              </label>
                              <select
                                id={`${domainDef.key}-${sel.id}`}
                                className={formStyles.select}
                                value={(getFieldVal(domainDef.key, sel.id) as string) ?? ''}
                                onChange={(e) =>
                                  updateDomainField(domainDef.key, sel.id, e.target.value || undefined)
                                }
                              >
                                <option value="">—</option>
                                {sel.options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {isTamil ? opt.labelTa : opt.labelEn}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}

                          {/* Numbers */}
                          {domainDef.numbers?.map((num: SymptomNumberDef) => (
                            <div key={num.id} className={formStyles.field}>
                              <label htmlFor={`${domainDef.key}-${num.id}`} className={formStyles.label}>
                                {isTamil ? num.labelTa : num.labelEn}
                              </label>
                              <input
                                id={`${domainDef.key}-${num.id}`}
                                type="number"
                                className={formStyles.input}
                                inputMode="numeric"
                                min={num.min}
                                max={num.max}
                                step={num.step ?? 1}
                                value={(getFieldVal(domainDef.key, num.id) as number) ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value ? parseFloat(e.target.value) : null;
                                  updateDomainField(domainDef.key, num.id, val);
                                }}
                              />
                            </div>
                          ))}

                          {/* Text Inputs */}
                          {domainDef.texts?.map((txt: SymptomTextDef) => (
                            <div
                              key={txt.id}
                              className={formStyles.field}
                              style={{ gridColumn: '1 / -1' }}
                            >
                              <label htmlFor={`${domainDef.key}-${txt.id}`} className={formStyles.label}>
                                {isTamil ? txt.labelTa : txt.labelEn}
                              </label>
                              <input
                                id={`${domainDef.key}-${txt.id}`}
                                type="text"
                                className={formStyles.input}
                                maxLength={txt.maxLength ?? 200}
                                placeholder={isTamil ? txt.placeholderTa : txt.placeholderEn}
                                value={(getFieldVal(domainDef.key, txt.id) as string) ?? ''}
                                onChange={(e) =>
                                  updateDomainField(
                                    domainDef.key,
                                    txt.id,
                                    e.target.value ? e.target.value : null
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <div className={formStyles.navRow}>
          <button
            type="button"
            className={formStyles.secondaryBtn}
            onClick={onPrev}
            id="symptoms-prev-btn"
          >
            ← {t.common?.previous || 'Previous Step'}
          </button>
          <button
            type="button"
            className={formStyles.primaryBtn}
            onClick={onNext}
            id="symptoms-next-btn"
          >
            {t.common?.next || 'Next Step'} →
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Clear Selections */}
      {showClearConfirm && (
        <div
          className={domainStyles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-modal-title"
        >
          <div className={domainStyles.modalCard}>
            <div className={domainStyles.modalHeader}>
              <div className={domainStyles.modalWarningIcon} aria-hidden="true">
                ⚠️
              </div>
              <h3 id="clear-modal-title" className={domainStyles.modalTitle}>
                {isTamil ? 'அனைத்து தேர்வுகளையும் நீக்கவா?' : 'Clear All Symptom Selections?'}
              </h3>
            </div>
            <p className={domainStyles.modalBody}>
              {isTamil
                ? `தேர்ந்தெடுக்கப்பட்ட ${totalSelectedCount} அறிகுறிகளும் நீக்கப்படும். இந்த செயலை தொடர விரும்புகிறீர்களா?`
                : `Are you sure you want to clear all ${totalSelectedCount} selected symptom items across the 12 clinical domains? This action cannot be undone.`}
            </p>
            <div className={domainStyles.modalActions}>
              <button
                type="button"
                className={domainStyles.modalCancelBtn}
                onClick={() => setShowClearConfirm(false)}
              >
                {t.common?.cancel || 'Cancel'}
              </button>
              <button
                type="button"
                className={domainStyles.modalConfirmBtn}
                onClick={handleClearAll}
              >
                {isTamil ? 'ஆம், நீக்கு' : 'Confirm Clear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
