// src/i18n/translate.ts
//
// Pure translation logic (no React) so it is trivially unit-testable and
// usable outside components (toasts, validation schemas, API error mapping).
import { DEFAULT_LANGUAGE, getLanguageConfig, type Language } from "./languages";
import { getDictionary } from "./resources";
import type { TranslateParams } from "@/types/i18n.types";

const PLACEHOLDER = /\{\{\s*([\w.]+)\s*\}\}/g;

/** Replaces {{name}} with params.name. Unknown placeholders are left visible so bugs are noticeable. */
export function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(PLACEHOLDER, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name] ?? "") : match,
  );
}

const pluralRules = new Map<string, Intl.PluralRules>();
function pluralCategory(lang: Language, count: number): Intl.LDMLPluralRule {
  const locale = getLanguageConfig(lang).intlLocale;
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return rules.select(count);
}

/** Languages to consult, in order: requested -> its configured fallback -> default. */
function chain(lang: Language): Language[] {
  const out: Language[] = [lang];
  const fb = getLanguageConfig(lang).fallback as Language | undefined;
  if (fb && !out.includes(fb)) out.push(fb);
  if (!out.includes(DEFAULT_LANGUAGE)) out.push(DEFAULT_LANGUAGE);
  return out;
}

const warned = new Set<string>();
function warnMissing(lang: Language, key: string) {
  if (!import.meta.env?.DEV) return;
  const id = `${lang}:${key}`;
  if (warned.has(id)) return;
  warned.add(id);
   
  console.warn(`[i18n] Missing "${lang}" translation for "${key}"`);
}

function lookup(lang: Language, key: string, params?: TranslateParams): string | undefined {
  for (const l of chain(lang)) {
    const dict = getDictionary(l);
    if (!dict) continue;
    const count = params?.count;
    if (typeof count === "number") {
      const v = dict[`${key}_${pluralCategory(l, count)}`] || dict[`${key}_other`];
      if (v) return interpolate(v, params);
    }
    const v = dict[key];
    if (v) return interpolate(v, params);
  }
  return undefined;
}

/** Translate with English fallback; returns the key itself if nothing is found. */
export function translate(lang: Language, key: string, params?: TranslateParams): string {
  const found = lookup(lang, key, params);
  if (found !== undefined) return found;
  warnMissing(lang, key);
  return key;
}

/** Like translate(), but returns `fallback` instead of the key when nothing is found. */
export function translateOr(lang: Language, key: string, fallback: string, params?: TranslateParams): string {
  return lookup(lang, key, params) ?? interpolate(fallback, params);
}
