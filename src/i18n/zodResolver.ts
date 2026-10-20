// src/i18n/zodResolver.ts
//
// react-hook-form + zod: validation messages are English literals inside the schemas
// (src/schemas/*.ts), which are module-scope and can't call hooks. Rather than rewrite every
// schema, this wrapper translates each error message AFTER validation by looking the exact
// English text up in the `validation` namespace (keys ARE the English messages). Messages with
// no entry — e.g. a new schema rule nobody has translated yet — pass through unchanged, so
// forgetting a translation degrades to English, never to a blank or a raw key.
//
// To translate a new rule: add `"<exact English message>": "<translation>"` to
// locales/<lang>/validation.json (English file gets the same key = same text).
import { zodResolver } from "@hookform/resolvers/zod";
import { getActiveLanguage } from "./format";
import { translateOr } from "./translate";

type Resolver = ReturnType<typeof zodResolver>;

function translateErrors(node: unknown): void {
  if (!node || typeof node !== "object") return;
  const rec = node as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message) {
    rec.message = translateOr(getActiveLanguage(), `validation.${rec.message}`, rec.message);
  }
  for (const v of Object.values(rec)) if (v && typeof v === "object" && v !== rec.ref) translateErrors(v);
}

export const i18nZodResolver = ((...args: Parameters<typeof zodResolver>) => {
  const base = zodResolver(...args);
  return async (...r: Parameters<Resolver>) => {
    const result = await base(...r);
    if (result && "errors" in result) translateErrors(result.errors);
    return result;
  };
}) as typeof zodResolver;
