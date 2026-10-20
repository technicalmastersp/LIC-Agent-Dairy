import { cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslateParams, TranslationKey } from "@/types/i18n.types";

/**
 * Rich-text translations — for sentences that contain links or emphasis.
 *
 *   en: "By signing up you agree to our <terms>Terms</terms> and <privacy>Privacy Policy</privacy>."
 *   <Trans i18nKey="auth.signup.agree" components={{ terms: <Link to="/terms-of-service" />, privacy: <Link to="/privacy-policy" /> }} />
 *
 * Why not split the sentence into fragments around the <Link>s? Word order
 * differs per language (Hindi is subject-object-verb), so translators must
 * be able to move the link anywhere inside ONE sentence.
 *
 * Safe by construction: only tags that map to a supplied component (or the
 * built-in <b>/<i>/<br/>) become elements; nothing is injected as HTML.
 */
const DEFAULT_COMPONENTS: Record<string, ReactElement> = {
  b: <strong />,
  strong: <strong />,
  i: <em />,
  em: <em />,
  br: <br />,
};

const TAG = /<(\/?)([a-zA-Z][\w-]*)\s*(\/?)>/g;

export function renderRich(input: string, components: Record<string, ReactElement> = {}): ReactNode[] {
  const map = { ...DEFAULT_COMPONENTS, ...components };
  type Frame = { tag: string | null; children: ReactNode[] };
  const stack: Frame[] = [{ tag: null, children: [] }];
  let last = 0;
  let uid = 0;
  const top = () => stack[stack.length - 1];

  const closeTop = () => {
    const frame = stack.pop()!;
    const comp = frame.tag ? map[frame.tag] : undefined;
    const node =
      comp && isValidElement(comp)
        ? cloneElement(comp, { key: `r${uid++}` }, ...frame.children)
        : <Fragment key={`r${uid++}`}>{frame.children}</Fragment>;
    top().children.push(node);
  };

  for (const m of input.matchAll(TAG)) {
    const [raw, closing, tag, selfClosing] = m;
    if (m.index! > last) top().children.push(input.slice(last, m.index));
    last = m.index! + raw.length;

    if (selfClosing) {
      const comp = map[tag];
      if (comp && isValidElement(comp)) top().children.push(cloneElement(comp, { key: `r${uid++}` }));
    } else if (!closing) {
      stack.push({ tag, children: [] });
    } else if (stack.length > 1 && top().tag === tag) {
      closeTop();
    } else {
      top().children.push(raw); // stray closing tag: keep visible rather than corrupt the tree
    }
  }
  if (last < input.length) top().children.push(input.slice(last));
  while (stack.length > 1) closeTop(); // tolerate unbalanced tags from a translator typo
  return stack[0].children;
}

interface TransProps {
  i18nKey: TranslationKey;
  params?: TranslateParams;
  components?: Record<string, ReactElement>;
}

const Trans = ({ i18nKey, params, components }: TransProps) => {
  const { t } = useLanguage();
  return <>{renderRich(t(i18nKey, params), components)}</>;
};

export default Trans;
