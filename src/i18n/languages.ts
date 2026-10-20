// src/i18n/languages.ts
//
// THE registry of supported languages — the only file (besides the locale
// folder itself) you touch to add a language. `npm run i18n:add -- <code>`
// scaffolds both for you; see docs/I18N.md.
//
// `Language` is derived from this list, so adding an entry here makes the
// new code a valid `Language` everywhere (switcher, storage validation,
// <html lang>, hreflang/og:locale) with no other edits.

export interface LanguageConfig {
  /** BCP-47 primary code, also the locale folder name: "en", "hi", "mr"… */
  readonly code: string;
  /** Name in English — for admin/docs/logging. */
  readonly name: string;
  /** Name in the language itself — what the switcher shows to its speakers. */
  readonly nativeName: string;
  /** Text direction. Drives <html dir>. */
  readonly dir: "ltr" | "rtl";
  /** BCP-47 tag for Intl.* (dates, plural rules, collation). */
  readonly intlLocale: string;
  /** Open Graph locale, e.g. "hi_IN" (note the underscore). */
  readonly ogLocale: string;
  /** Language to consult when a key is missing. Defaults to DEFAULT_LANGUAGE. */
  readonly fallback?: string;
}

export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr", intlLocale: "en-IN", ogLocale: "en_IN" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr", intlLocale: "hi-IN", ogLocale: "hi_IN" },
  // ADD NEW LANGUAGES ABOVE THIS LINE (i18n:add inserts here)
] as const satisfies readonly LanguageConfig[];

export type Language = (typeof LANGUAGES)[number]["code"];

/** Source language: every key must exist here; all other languages fall back to it. */
export const DEFAULT_LANGUAGE: Language = "en";

/** localStorage key. Unchanged from the original implementation — api/apiClient.js
 *  preserves it across session wipes, so don't rename it. */
export const LANGUAGE_STORAGE_KEY = "language";

export const SUPPORTED_LANGUAGE_CODES: readonly Language[] = LANGUAGES.map((l) => l.code);

export const isSupportedLanguage = (value: unknown): value is Language =>
  typeof value === "string" && (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(value);

export const getLanguageConfig = (code: string): LanguageConfig =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
