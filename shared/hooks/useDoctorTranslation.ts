'use client';
import { useLanguage } from '@/shared/context/LanguageContext';
import { TRANSLATIONS } from '@/shared/locales/doctor';

export function useDoctorTranslation() {
  const { language } = useLanguage();
  const t = (key: keyof typeof TRANSLATIONS['en']): string =>
    (TRANSLATIONS[language] as Record<string, string>)[key] ||
    (TRANSLATIONS.en as Record<string, string>)[key] ||
    key;
  return { t, language };
}
