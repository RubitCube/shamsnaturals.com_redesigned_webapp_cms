import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enUS from './locales/en-US.json';
import enGB from './locales/en-GB.json';
import it from './locales/it.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';

import adminEnUS from './locales/admin-en-US.json';
import adminEnGB from './locales/admin-en-GB.json';
import adminIt from './locales/admin-it.json';
import adminAr from './locales/admin-ar.json';
import adminHi from './locales/admin-hi.json';

const resources = {
  'en-US': { 
    translation: enUS,
    admin: adminEnUS
  },
  'en-GB': { 
    translation: enGB,
    admin: adminEnGB
  },
  'it': { 
    translation: it,
    admin: adminIt
  },
  'ar': { 
    translation: ar,
    admin: adminAr
  },
  'hi': { 
    translation: hi,
    admin: adminHi
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-US',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

// Set document direction based on language
const updateDocumentDirection = (lng: string) => {
  if (lng === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = lng.split('-')[0];
  }
};

// Set initial direction
updateDocumentDirection(i18n.language);

// Update direction when language changes
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;

