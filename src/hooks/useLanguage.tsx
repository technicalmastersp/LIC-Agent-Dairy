import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredLanguage, setStoredLanguage, getTranslation } from '@/utils/translations';
import type { Language, Translations } from "@/types/utils/translations.types";
import type { LanguageContextType } from "@/types/hooks/useLanguage.types";
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLang] = useState<Language>(getStoredLanguage());

  const setLanguage = (lang: Language) => {
    setLang(lang);
    setStoredLanguage(lang);
  };

  const t = (key: keyof Translations): string => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};