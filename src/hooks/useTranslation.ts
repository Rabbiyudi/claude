'use client';

import { translations, type TranslationKey } from '@/i18n/translations';
import { useStore } from '@/store/useStore';

export function useTranslation() {
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'he';
  const dir = isRTL ? 'rtl' : 'ltr';

  return {
    t,
    language,
    setLanguage,
    isRTL,
    dir,
  };
}
