import type { Language, Translations } from "@/types/utils/translations.types";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}
