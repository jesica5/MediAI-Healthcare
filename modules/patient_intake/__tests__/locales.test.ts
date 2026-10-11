// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import enLocale from '../locales/en-US.json';
import taLocale from '../locales/ta-IN.json';
import reviewNeededTa from '../locales/review-needed-ta.json';
import { translate } from '../locales/i18n';

describe('Locales & Bilingual Dictionary Tests', () => {
  describe('Mandatory Tamil Clinical Symptom Mappings', () => {
    it('translates "Chest Pain" to "நெஞ்சு வலி"', () => {
      expect(taLocale.symptoms.domains.cardiac.chestPain).toBe('நெஞ்சு வலி');
      expect(translate('ta', 'symptoms.domains.cardiac.chestPain')).toBe('நெஞ்சு வலி');
    });

    it('translates "Shortness of Breath" to "மூச்சுத்திணறல்"', () => {
      expect(taLocale.symptoms.domains.respiratory.shortnessOfBreath).toBe('மூச்சுத்திணறல்');
      expect(translate('ta', 'symptoms.domains.respiratory.shortnessOfBreath')).toBe('மூச்சுத்திணறல்');
    });

    it('translates "Dizziness/Fainting" to "தலைச்சுற்றல் / மயக்கம்"', () => {
      expect(taLocale.symptoms.domains.neurological.dizzinessFainting).toBe('தலைச்சுற்றல் / மயக்கம்');
      expect(translate('ta', 'symptoms.domains.neurological.dizzinessFainting')).toBe('தலைச்சுற்றல் / மயக்கம்');
    });

    it('translates "Severe Abdominal Pain" to "கடுமையான வயிற்று வலி"', () => {
      expect(taLocale.symptoms.domains.gastrointestinal.severeAbdominalPain).toBe('கடுமையான வயிற்று வலி');
      expect(translate('ta', 'symptoms.domains.gastrointestinal.severeAbdominalPain')).toBe('கடுமையான வயிற்று வலி');
    });
  });

  describe('review-needed-ta.json Registry Verification', () => {
    it('verifies that the 4 mandatory keys are flagged as validated and excluded from review-needed list', () => {
      expect(reviewNeededTa.requiredKeysValidated).toHaveLength(4);
      for (const requiredKey of reviewNeededTa.requiredKeysValidated) {
        expect(reviewNeededTa.needsReviewKeys).not.toContain(requiredKey);
      }
    });

    it('verifies that each key flagged for review exists in ta-IN.json', () => {
      for (const keyPath of reviewNeededTa.needsReviewKeys) {
        const val = translate('ta', keyPath, 'NOT_FOUND');
        expect(val).not.toBe('NOT_FOUND');
        expect(typeof val).toBe('string');
      }
    });
  });

  describe('English locale parity and fallback behavior', () => {
    it('returns key path or fallback if translation is not found', () => {
      expect(translate('en', 'nonexistent.deep.key', 'Fallback Text')).toBe('Fallback Text');
      expect(translate('en', 'nonexistent.deep.key')).toBe('nonexistent.deep.key');
    });

    it('translates basic step and disclaimer keys', () => {
      expect(translate('en', 'common.disclaimer')).toContain('Decision-support prototype');
      expect(translate('ta', 'common.disclaimer')).toContain('முடிவு-ஆதரவு முன்மாதிரி');
    });
  });
});
