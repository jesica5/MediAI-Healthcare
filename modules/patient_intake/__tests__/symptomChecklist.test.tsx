// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CLINICAL_DOMAINS } from '../constants/symptoms';
import { SymptomChecklistStep } from '../components/SymptomChecklistStep';
import { assessPayloadSchema } from '../schemas/assessPayload.schema';
import { SymptomVector } from '../types';

describe('Clinical Symptoms Checklist Module (Step 2)', () => {
  describe('Domain Structure & Ordering Specification', () => {
    it('defines exactly 12 clinical domains in the exact required order', () => {
      expect(CLINICAL_DOMAINS).toHaveLength(12);

      const expectedOrder = [
        'infection_sepsis',
        'respiratory',
        'cardiac',
        'neurological',
        'blood_pressure',
        'diabetes',
        'gastrointestinal',
        'injury_trauma',
        'pregnancy',
        'allergic',
        'dehydration',
        'toxic_exposure',
      ];

      CLINICAL_DOMAINS.forEach((domain, index) => {
        expect(domain.key).toBe(expectedOrder[index]);
        expect(domain.order).toBe(index + 1);
      });
    });

    it('ensures every domain includes an "other" symptom checkbox option', () => {
      CLINICAL_DOMAINS.forEach((domain) => {
        const hasOther = domain.checkboxes.some((cb) => cb.id === 'other');
        expect(hasOther).toBe(true);
      });
    });

    it('ensures all symptom checkboxes have non-empty English and Tamil labels', () => {
      CLINICAL_DOMAINS.forEach((domain) => {
        expect(domain.titleEn.length).toBeGreaterThan(0);
        expect(domain.titleTa.length).toBeGreaterThan(0);

        domain.checkboxes.forEach((cb) => {
          expect(cb.id.length).toBeGreaterThan(0);
          expect(cb.labelEn.length).toBeGreaterThan(0);
          expect(cb.labelTa.length).toBeGreaterThan(0);
        });
      });
    });

    it('verifies no duplicate symptom IDs exist within any single domain', () => {
      CLINICAL_DOMAINS.forEach((domain) => {
        const ids = domain.checkboxes.map((cb) => cb.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });
    });
  });

  describe('Component Rendering & Interactive Accordion Behaviors', () => {
    it('renders the centered content panel with title, subtitle, and counter', () => {
      const onChange = vi.fn();
      const onNext = vi.fn();
      const onPrev = vi.fn();

      render(
        <SymptomChecklistStep
          value={{}}
          language="en"
          onChange={onChange}
          onNext={onNext}
          onPrev={onPrev}
        />
      );

      expect(screen.getByRole('heading', { level: 2, name: /Clinical Symptoms Checklist/i })).toBeDefined();
      expect(screen.getByText(/Check all symptoms observed or reported across 12 clinical domains/i)).toBeDefined();
      expect(screen.getByText(/0 Symptoms Selected/i)).toBeDefined();
    });

    it('renders all 12 domain accordions', () => {
      render(
        <SymptomChecklistStep
          value={{}}
          language="en"
          onChange={vi.fn()}
          onNext={vi.fn()}
          onPrev={vi.fn()}
        />
      );

      expect(screen.getByText(/1\. Infection & Sepsis/i)).toBeDefined();
      expect(screen.getByText(/2\. Respiratory/i)).toBeDefined();
      expect(screen.getByText(/3\. Cardiac/i)).toBeDefined();
      expect(screen.getByText(/4\. Neurological/i)).toBeDefined();
      expect(screen.getByText(/5\. Blood Pressure Associated Symptoms/i)).toBeDefined();
      expect(screen.getByText(/6\. Diabetes & Metabolic/i)).toBeDefined();
      expect(screen.getByText(/7\. Gastrointestinal/i)).toBeDefined();
      expect(screen.getByText(/8\. Injury & Trauma/i)).toBeDefined();
      expect(screen.getByText(/9\. Pregnancy & Obstetric/i)).toBeDefined();
      expect(screen.getByText(/10\. Allergic & Anaphylaxis/i)).toBeDefined();
      expect(screen.getByText(/11\. Hydration Status/i)).toBeDefined();
      expect(screen.getByText(/12\. Multi-system & Toxic Exposure/i)).toBeDefined();
    });

    it('toggles accordion expansion when header button is clicked', () => {
      render(
        <SymptomChecklistStep
          value={{}}
          language="en"
          onChange={vi.fn()}
          onNext={vi.fn()}
          onPrev={vi.fn()}
        />
      );

      const cardiacHeaderBtn = screen.getByRole('button', { name: /3\. Cardiac/i });
      expect(cardiacHeaderBtn.getAttribute('aria-expanded')).toBe('false');

      fireEvent.click(cardiacHeaderBtn);
      expect(cardiacHeaderBtn.getAttribute('aria-expanded')).toBe('true');

      fireEvent.click(cardiacHeaderBtn);
      expect(cardiacHeaderBtn.getAttribute('aria-expanded')).toBe('false');
    });

    it('updates selections when checkboxes are clicked and updates total count', () => {
      let currentVal: Partial<SymptomVector> = {};
      const onChange = vi.fn((newVal) => {
        currentVal = newVal;
      });

      const { rerender } = render(
        <SymptomChecklistStep
          value={currentVal}
          language="en"
          onChange={onChange}
          onNext={vi.fn()}
          onPrev={vi.fn()}
        />
      );

      // Sepsis altered mentation checkbox (domain 1 default open)
      const alteredMentationCheckbox = screen.getByLabelText(/Altered Mental State \/ Confusion/i);
      expect((alteredMentationCheckbox as HTMLInputElement).checked).toBe(false);

      fireEvent.click(alteredMentationCheckbox);
      expect(onChange).toHaveBeenCalled();

      // Rerender with updated value
      rerender(
        <SymptomChecklistStep
          value={{
            infection_sepsis: { altered_mentation: true, fever: true },
          }}
          language="en"
          onChange={onChange}
          onNext={vi.fn()}
          onPrev={vi.fn()}
        />
      );

      expect(screen.getByText(/2 Symptoms Selected/i)).toBeDefined();
      expect(screen.getByText(/2 selected/i)).toBeDefined();
    });

    it('preserves symptom selections across accordion toggles', () => {
      const selectedValue: Partial<SymptomVector> = {
        infection_sepsis: { altered_mentation: true },
        cardiac: { chest_pain: true },
      };

      const { rerender } = render(
        <SymptomChecklistStep
          value={selectedValue}
          language="en"
          onChange={vi.fn()}
          onNext={vi.fn()}
          onPrev={vi.fn()}
        />
      );

      // Open Cardiac accordion
      const cardiacHeaderBtn = screen.getByRole('button', { name: /3\. Cardiac/i });
      fireEvent.click(cardiacHeaderBtn);

      const chestPainCheckbox = screen.getByLabelText(/Acute Chest Pain \/ Heavy Pressure/i);
      expect((chestPainCheckbox as HTMLInputElement).checked).toBe(true);

      // Close and reopen
      fireEvent.click(cardiacHeaderBtn);
      fireEvent.click(cardiacHeaderBtn);

      expect((screen.getByLabelText(/Acute Chest Pain \/ Heavy Pressure/i) as HTMLInputElement).checked).toBe(true);
    });

    it('shows confirmation modal when Clear Selections is clicked, and clears state on confirmation', () => {
      const onChange = vi.fn();
      const selectedValue: Partial<SymptomVector> = {
        infection_sepsis: { altered_mentation: true },
      };

      render(
        <SymptomChecklistStep
          value={selectedValue}
          language="en"
          onChange={onChange}
          onNext={vi.fn()}
          onPrev={vi.fn()}
        />
      );

      const clearBtn = screen.getByRole('button', { name: /Clear all symptom selections/i });
      fireEvent.click(clearBtn);

      // Modal appears
      expect(screen.getByText(/Clear All Symptom Selections\?/i)).toBeDefined();

      const confirmBtn = screen.getByRole('button', { name: /Confirm Clear/i });
      fireEvent.click(confirmBtn);

      expect(onChange).toHaveBeenCalledWith({});
    });

    it('triggers onPrev and onNext callbacks when navigation buttons are clicked', () => {
      const onPrev = vi.fn();
      const onNext = vi.fn();

      render(
        <SymptomChecklistStep
          value={{}}
          language="en"
          onChange={vi.fn()}
          onNext={onNext}
          onPrev={onPrev}
        />
      );

      const prevBtn = screen.getByRole('button', { name: /Previous Step/i });
      const nextBtn = screen.getByRole('button', { name: /Next Step/i });

      fireEvent.click(prevBtn);
      expect(onPrev).toHaveBeenCalledTimes(1);

      fireEvent.click(nextBtn);
      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('supports Tamil language rendering without clearing selections', () => {
      const selectedValue: Partial<SymptomVector> = {
        cardiac: { chest_pain: true },
      };

      render(
        <SymptomChecklistStep
          value={selectedValue}
          language="ta"
          onChange={vi.fn()}
          onNext={vi.fn()}
          onPrev={vi.fn()}
        />
      );

      // Check Tamil domain header
      expect(screen.getByText(/3\. இருதய மண்டலம்/i)).toBeDefined();
      expect(screen.getByText(/1 தேர்வு/i)).toBeDefined();
    });
  });

  describe('Contract and Assess Payload Schema Compatibility', () => {
    it('successfully validates assessPayloadSchema when extra symptoms are present across domains', () => {
      const payloadWithExtraSymptoms = {
        patient_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        chief_complaint: 'Severe chills, dyspnea, and dizziness',
        symptom_vector: {
          infection_sepsis: {
            altered_mentation: false,
            fever: true,
            hypothermia: false,
            other: true,
          },
          respiratory: {
            shortness_of_breath: true,
            wheeze: true,
            chest_tightness: true,
            cough_character: 'productive' as const,
          },
          cardiac: {
            chest_pain: true,
            syncope: true,
            pedal_edema: false,
          },
          neurological: {
            dizziness_fainting: true,
            severe_thunderclap_headache: false,
          },
          blood_pressure: {
            blurred_vision: true,
            epistaxis: false,
          },
          diabetes: {
            polydipsia_polyuria: true,
            hypoglycemia_symptoms: false,
          },
          gastrointestinal: {
            severe_abdominal_pain: true,
            nausea_vomiting: true,
            hematemesis: false,
          },
          injury_trauma: {
            active_bleeding: false,
            blunt_head_trauma: false,
          },
          pregnancy: {
            fluid_leakage: false,
          },
          allergic: {
            throat_tightness: true,
            facial_swelling: true,
          },
          dehydration: {
            extreme_thirst: true,
            sunken_eyes: true,
          },
          toxic_exposure: {
            chemical_poisoning: false,
            smoke_inhalation: true,
          },
        },
        vitals: {
          heart_rate: 104,
          respiratory_rate: 22,
          systolic_bp: 130,
          diastolic_bp: 82,
          oxygen_saturation: 97.0,
          temperature_celsius: 38.6,
          capillary_blood_glucose: 120.0,
        },
        missing_essential_vitals: [],
        medical_history: {
          immunosuppression: false,
          severe_chronic_comorbidity: false,
          comorbidity_note: null,
          pregnancy_status: 'not_applicable' as const,
        },
        language: 'en' as const,
      };

      const result = assessPayloadSchema.safeParse(payloadWithExtraSymptoms);
      expect(result.success).toBe(true);
    });
  });
});
