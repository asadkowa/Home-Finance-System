import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

// Function to load saved translations from localStorage
const loadSavedTranslations = (lang, defaultTranslations) => {
  try {
    const saved = localStorage.getItem(`translations_${lang}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge saved translations with defaults to ensure all keys exist
      return { ...defaultTranslations, ...parsed };
    }
  } catch (error) {
    console.error(`Error loading saved translations for ${lang}:`, error);
  }
  return defaultTranslations;
};

const savedEnTranslations = loadSavedTranslations('en', enTranslations);
const savedArTranslations = loadSavedTranslations('ar', arTranslations);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: savedEnTranslations,
      },
      ar: {
        translation: savedArTranslations,
      },
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
