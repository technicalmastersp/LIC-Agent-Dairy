// src/i18n/resources.ts
//
// Language-pack loading. English is eager (see locales/en/index.ts); every
// other language is its own lazily-fetched chunk, auto-discovered from
// ./locales/<code>/index.ts — adding a language never grows the main bundle.
import en from "./locales/en";
import { DEFAULT_LANGUAGE, isSupportedLanguage, type Language } from "./languages";
import type { Dictionary } from "@/types/i18n.types";

type Loader = () => Promise<{ default: Dictionary }>;

// The negative pattern keeps English out of the lazy set (it is imported
// statically above; listing it again would only produce a bundler warning).
const lazyLoaders = import.meta.glob<{ default: Dictionary }>(
  ["./locales/*/index.ts", "!./locales/en/index.ts"],
) as Record<string, Loader>;

const loaderFor = (lang: Language): Loader | undefined => lazyLoaders[`./locales/${lang}/index.ts`];

const store: Partial<Record<Language, Dictionary>> = { [DEFAULT_LANGUAGE]: en as Dictionary };
const inFlight = new Map<Language, Promise<void>>();

export const isLanguageLoaded = (lang: Language): boolean => !!store[lang];

export const getDictionary = (lang: Language): Dictionary | undefined => store[lang];

/** Loads a language pack once; concurrent callers share the same promise. */
export function loadLanguage(lang: Language): Promise<void> {
  if (!isSupportedLanguage(lang) || store[lang]) return Promise.resolve();
  const existing = inFlight.get(lang);
  if (existing) return existing;

  const loader = loaderFor(lang);
  if (!loader) {
    return Promise.reject(new Error(`[i18n] No locale pack found at src/i18n/locales/${lang}/index.ts`));
  }
  const p = loader()
    .then((mod) => {
      store[lang] = mod.default;
    })
    .finally(() => inFlight.delete(lang));
  inFlight.set(lang, p);
  return p;
}
