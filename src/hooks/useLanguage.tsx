import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import PageLoader from "@/components/PageLoader";
import {
  DEFAULT_LANGUAGE,
  getLanguageConfig,
  isSupportedLanguage,
  type Language,
} from "@/i18n/languages";
import { isLanguageLoaded, loadLanguage } from "@/i18n/resources";
import { getStoredLanguage, setStoredLanguage } from "@/i18n/storage";
import { setActiveLanguage } from "@/i18n/format";
import { translate, translateOr } from "@/i18n/translate";
import type { LanguageContextType, TranslateParams, TranslationKey } from "@/types/i18n.types";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLang] = useState<Language>(getStoredLanguage);
  // English is bundled, so the default path is ready on the very first render
  // (no flash, synchronous for tests). A stored non-English preference waits
  // for its pack — a few ms for a same-origin chunk — rather than flashing
  // English first.
  const [ready, setReady] = useState<boolean>(() => isLanguageLoaded(language));
  const requestId = useRef(0);

  // Plain-module formatters (utils/dateFormat.ts) read this during render, so
  // it must be current *before* children render — not in an effect.
  setActiveLanguage(language);

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    loadLanguage(language)
      .catch((err) => {
        // Offline / chunk 404: degrade to English instead of a blank app.
        console.error("[i18n] Could not load language pack, falling back to English", err);
        if (!cancelled) {
          setActiveLanguage(DEFAULT_LANGUAGE);
          setLang(DEFAULT_LANGUAGE);
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [language, ready]);

  // Keep <html lang/dir> in sync: screen readers pick the right voice, browsers
  // don't offer to "translate" content that is already in the page language,
  // and RTL languages added later flip direction without further code.
  useEffect(() => {
    const cfg = getLanguageConfig(language);
    document.documentElement.lang = cfg.code;
    document.documentElement.dir = cfg.dir;
  }, [language]);

  const setLanguage = useCallback(async (next: Language) => {
    if (!isSupportedLanguage(next)) return;
    const id = ++requestId.current;
    try {
      await loadLanguage(next);
    } catch (err) {
      console.error("[i18n] Could not load language pack", err);
      return; // stay on the current language
    }
    if (id !== requestId.current) return; // a newer switch superseded this one
    setActiveLanguage(next);
    setLang(next);
    setReady(true);
    setStoredLanguage(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams) => translate(language, key, params),
    [language],
  );
  const tOr = useCallback(
    (key: string, fallback: string, params?: TranslateParams) => translateOr(language, key, fallback, params),
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t, tOr }), [language, setLanguage, t, tOr]);

  if (!ready) return <PageLoader />;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

/** Like useLanguage(), but returns undefined outside a LanguageProvider instead of throwing.
 *  For passive consumers (metadata, build-time rendering) that must degrade to the default language. */
export const useOptionalLanguage = () => useContext(LanguageContext);
