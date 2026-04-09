import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import cs from './cs.json';
import ru from './ru.json';

function getSavedLanguage(): string {
  try {
    const profilesRaw = localStorage.getItem('ti2mi-profiles');
    const activeId = localStorage.getItem('ti2mi-active-profile');
    if (profilesRaw && activeId) {
      const profiles = JSON.parse(profilesRaw);
      const active = profiles.find((p: { id: string }) => p.id === activeId);
      if (active?.selectedLanguage) return active.selectedLanguage;
    }
    // Fallback: old single-profile key
    const oldProfile = localStorage.getItem('ti2mi-profile');
    if (oldProfile) {
      const parsed = JSON.parse(oldProfile);
      if (parsed?.selectedLanguage) return parsed.selectedLanguage;
    }
  } catch { /* ignore */ }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    cs: { translation: cs },
    ru: { translation: ru },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
