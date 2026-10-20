// src/i18n/format.ts
//
// The active language, readable from plain (non-React) modules such as
// utils/dateFormat.ts. LanguageProvider keeps it in sync; formatters that
// call getActiveIntlLocale() therefore follow the user's language without
// every call site having to thread a locale through.
import { DEFAULT_LANGUAGE, getLanguageConfig, type Language } from "./languages";

let active: Language = DEFAULT_LANGUAGE;

export const setActiveLanguage = (lang: Language): void => {
  active = lang;
};
export const getActiveLanguage = (): Language => active;
export const getActiveIntlLocale = (): string => getLanguageConfig(active).intlLocale;
