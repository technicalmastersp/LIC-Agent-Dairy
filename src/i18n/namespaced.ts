// Prefixes every key of a flat JSON namespace with "<ns>." — at runtime AND in
// the type system, so `t("nav.home")` is checked against the JSON's real keys.
export type Namespaced<N extends string, T extends Record<string, string>> = {
  [K in keyof T & string as `${N}.${K}`]: string;
};

export function namespaced<N extends string, T extends Record<string, string>>(
  ns: N,
  dict: T,
): Namespaced<N, T> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(dict)) out[`${ns}.${k}`] = v;
  return out as Namespaced<N, T>;
}
