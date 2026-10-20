// Guards the i18n system itself: engine, rich text, provider, lazy loading, persistence,
// registry-driven switcher, and that every language file stays consistent with English.
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { LanguageProvider, useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { renderRich } from "@/components/Trans";
import { LANGUAGES, DEFAULT_LANGUAGE, isSupportedLanguage, getLanguageConfig } from "@/i18n/languages";
import { interpolate, translate, translateOr } from "@/i18n/translate";
import { loadLanguage } from "@/i18n/resources";
import { getStoredLanguage } from "@/i18n/storage";
import { setActiveLanguage } from "@/i18n/format";
import { formatISTDate } from "@/utils/dateFormat";
import { check, languages as localeFolders, namespaces, readJson, LOCALES, SOURCE } from "../../scripts/i18n.mjs";
import path from "node:path";

beforeEach(() => {
  localStorage.clear();
  setActiveLanguage("en");
  document.documentElement.lang = "";
  document.documentElement.dir = "";
});

describe("language registry", () => {
  it("has English as the default and every registry entry has a locale folder", () => {
    expect(DEFAULT_LANGUAGE).toBe("en");
    const folders: string[] = localeFolders();
    for (const l of LANGUAGES) expect(folders, `locales/${l.code} missing`).toContain(l.code);
    for (const f of folders) expect(LANGUAGES.map((l) => l.code), `locales/${f} not in registry`).toContain(f);
  });
  it("validates codes and falls back to the first language for unknown ones", () => {
    expect(isSupportedLanguage("hi")).toBe(true);
    expect(isSupportedLanguage("xx")).toBe(false);
    expect(isSupportedLanguage(undefined)).toBe(false);
    expect(getLanguageConfig("nope").code).toBe("en");
  });
});

describe("translate()", () => {
  it("interpolates {{params}} and leaves unknown placeholders visible", () => {
    expect(interpolate("Hi {{ name }}, {{n}} left {{missing}}", { name: "Asha", n: 3 })).toBe("Hi Asha, 3 left {{missing}}");
    expect(interpolate("x {{a}}", { a: undefined })).toBe("x ");
  });
  it("returns English, then the key, when a translation is missing", async () => {
    await loadLanguage("hi");
    expect(translate("en", "nav.home")).toBe("Home");
    expect(translate("hi", "nav.home")).not.toBe("Home");
    expect(translate("hi", "definitely.not.a.key" )).toBe("definitely.not.a.key");
  });
  it("tOr returns the supplied fallback for runtime-only keys", () => {
    expect(translateOr("en", "status.nonexistent", "Fallback")).toBe("Fallback");
    expect(translateOr("en", "nav.home", "Fallback")).toBe("Home");
  });
  it("selects plural forms with Intl.PluralRules (English and Hindi)", async () => {
    await loadLanguage("hi");
    expect(translate("en", "auth.attemptsLeft", { count: 1 })).toMatch(/^1 attempt left/);
    expect(translate("en", "auth.attemptsLeft", { count: 2 })).toMatch(/^2 attempts left/);
    expect(translate("hi", "auth.attemptsLeft", { count: 1 })).toContain("1 प्रयास बचा");
    expect(translate("hi", "auth.attemptsLeft", { count: 2 })).toContain("2 प्रयास बचे");
  });
});

describe("rich text (<Trans> parser)", () => {
  const html = (s: string, c = {}) => renderToStaticMarkup(createElement("p", null, ...renderRich(s, c)));
  it("maps tags to supplied components and built-ins", () => {
    expect(html("a <b>bold</b> and <link>go</link>", { link: createElement("a", { href: "/x" }) }))
      .toBe('<p>a <strong>bold</strong> and <a href="/x">go</a></p>');
    expect(html("line<br/>two")).toBe("<p>line<br/>two</p>");
  });
  it("lets a translator reorder tags (SOV languages)", () => {
    expect(html("<link>पढ़ें</link> और जाएँ", { link: createElement("a", { href: "/x" }) })).toBe('<p><a href="/x">पढ़ें</a> और जाएँ</p>');
  });
  it("never injects HTML: unknown tags are dropped, text is escaped", () => {
    expect(html("<script>alert(1)</script>ok")).not.toContain("<script");
    expect(html("1 < 2 & 3")).toBe("<p>1 &lt; 2 &amp; 3</p>");
  });
  it("tolerates unbalanced tags from a translator typo", () => {
    expect(() => html("<b>never closed")).not.toThrow();
    expect(html("stray </b> close")).toContain("stray");
  });
});

const Probe = () => {
  const { t, language } = useLanguage();
  return <div><span data-testid="home">{t("nav.home")}</span><span data-testid="lang">{language}</span></div>;
};

describe("LanguageProvider", () => {
  it("renders English synchronously by default and sets <html lang/dir>", () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId("home").textContent).toBe("Home");
    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dir).toBe("ltr");
  });
  it("ignores an invalid stored language", () => {
    localStorage.setItem("language", "klingon");
    expect(getStoredLanguage()).toBe("en");
  });
  it("loads a stored non-English language lazily before rendering", async () => {
    localStorage.setItem("language", "hi");
    render(<LanguageProvider><Probe /></LanguageProvider>);
    await waitFor(() => expect(screen.getByTestId("lang").textContent).toBe("hi"));
    expect(screen.getByTestId("home").textContent).not.toBe("Home");
    expect(document.documentElement.lang).toBe("hi");
  });
  it("switches language at runtime, persists it, and updates date formatting", async () => {
    const date = "2026-09-05T10:00:00.000Z";
    render(<LanguageProvider><LanguageSwitcher /><Probe /></LanguageProvider>);
    const enDate = formatISTDate(date);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /change language/i }));
    await user.click(await screen.findByRole("menuitemradio", { name: /हिन्दी/ }));
    await waitFor(() => expect(screen.getByTestId("lang").textContent).toBe("hi"));
    expect(localStorage.getItem("language")).toBe("hi");
    expect(document.documentElement.lang).toBe("hi");
    expect(formatISTDate(date)).not.toBe(enDate); // month name localized
    await act(async () => {});
  });
  it("the switcher lists every registered language in its own script", async () => {
    render(<LanguageProvider><LanguageSwitcher /></LanguageProvider>);
    await userEvent.setup().click(screen.getByRole("button", { name: /change language/i }));
    for (const l of LANGUAGES) expect(await screen.findByRole("menuitemradio", { name: new RegExp(l.nativeName) })).toBeTruthy();
    cleanup();
  });
});

describe("locale files stay consistent with English", () => {
  it("have no stray keys, mismatched {{placeholders}} or mismatched rich-text tags", () => {
    const { errors } = check({ quiet: true });
    expect(errors.map((e: { msg: string }) => e.msg)).toEqual([]);
  });
  it("English plural families are complete (_one has _other)", () => {
    for (const ns of namespaces(SOURCE) as string[]) {
      const d = readJson(path.join(LOCALES, SOURCE, `${ns}.json`)) as Record<string, string>;
      for (const k of Object.keys(d)) if (k.endsWith("_one")) expect(d, `${ns}.${k}`).toHaveProperty(k.replace(/_one$/, "_other"));
    }
  });
  it("no locale value is whitespace-only", () => {
    for (const lang of localeFolders() as string[]) for (const ns of namespaces(lang) as string[]) {
      const d = readJson(path.join(LOCALES, lang, `${ns}.json`)) as Record<string, string>;
      for (const [k, v] of Object.entries(d)) if (v !== "") expect(v.trim(), `${lang}/${ns}.${k}`).not.toBe("");
    }
  });
});
