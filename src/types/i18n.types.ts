import type en from "@/i18n/locales/en";
import type { Language } from "@/i18n/languages";

export type { Language } from "@/i18n/languages";

/** Substitution values for {{placeholders}}. A numeric `count` also selects the plural form. */
export type TranslateParams = Record<string, string | number | null | undefined>;

type PluralSuffix = "zero" | "one" | "two" | "few" | "many" | "other";

/** Every key physically present in the English source dictionary. */
export type EnglishKey = keyof typeof en & string;

/**
 * Keys callers may pass to t(). Plural variants ("records.count_one",
 * "records.count_other") are addressed by their base ("records.count") — the
 * right form is picked from params.count at runtime.
 */
export type TranslationKey = EnglishKey extends infer K
  ? K extends `${infer Base}_${PluralSuffix}`
    ? Base | K
    : K
  : never;

/** A language dictionary: flat "namespace.key" -> string. */
export type Dictionary = Record<string, string>;

/** Non-English dictionaries may be incomplete; gaps fall back to English. */
export type PartialDictionary = Partial<Record<EnglishKey, string>>;

/** The shape of `t` — use for helpers that take a translator as an argument. */
export type TFunction = (key: TranslationKey, params?: TranslateParams) => string;

export interface LanguageContextType {
  language: Language;
  /** Switches language. Resolves once the language pack is loaded; a no-op for unsupported codes. */
  setLanguage: (lang: Language) => void | Promise<void>;
  /** Type-checked translation. Falls back to English, then to the key itself. */
  t: TFunction;
  /**
   * Translate a key that is only known at runtime (e.g. `status.${apiStatus}`),
   * returning `fallback` when no translation exists. Use this for server-provided
   * ids/enums instead of casting to TranslationKey.
   */
  tOr: (key: string, fallback: string, params?: TranslateParams) => string;
}
