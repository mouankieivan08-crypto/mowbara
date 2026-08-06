import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslation from '../i18n/fr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: frTranslation,
    },
    lng: localStorage.getItem('langue') || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
