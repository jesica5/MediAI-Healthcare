import enLocale from './en-US.json';
import taLocale from './ta-IN.json';
import { Language } from '../types';

export type LocaleDictionary = typeof enLocale;

const dictionaries: Record<Language, typeof enLocale> = {
  en: enLocale,
  ta: taLocale as unknown as typeof enLocale,
};

/**
 * Type-safe path accessor for locale dictionaries
 */
export function getTranslation(lang: Language): typeof enLocale {
  return dictionaries[lang] || dictionaries.en;
}

/**
 * Access nested key using dot notation, e.g. "vitals.heartRate"
 */
export function translate(lang: Language, path: string, fallback?: string): string {
  const dict = getTranslation(lang);
  const parts = path.split('.');
  let current: unknown = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return fallback || path;
    }
  }

  if (typeof current === 'string') {
    return current;
  }

  return fallback || path;
}
