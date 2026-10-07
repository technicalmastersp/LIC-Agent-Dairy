import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import SEO from "@/components/SEO";
import { extractSnapshot, validateSnapshot } from "../../scripts/snapshotExtract.mjs";

const PROD = "https://policyniketan.com";
const goodBody = "x".repeat(600);

describe("prerender snapshot extraction", () => {
  it("returns THIS page's canonical/description even when the shell carries the home page's", async () => {
    // dist/index.html after copy-prerendered merged the HOME snapshot
    document.head.innerHTML = `
      <meta name="description" content="GENERIC SITE-WIDE">
      <meta property="og:title" content="Home">
      <link rel="canonical" href="${PROD}/">`;
    document.body.innerHTML = `<div id="root"></div>`;

    render(createElement(HelmetProvider, null,
      createElement(SEO, { title: "Contact Us", description: "Contact page description", path: "/contact" })));
    await waitFor(() => expect(document.title).toMatch(/Contact Us/));

    const snap = extractSnapshot();
    expect(snap.canonical).toBe(`${PROD}/contact`);
    expect(snap.description).toBe("Contact page description");
    const ogTitles = snap.ogAndTwitterMeta.filter((m) => m.key === "og:title");
    expect(ogTitles).toHaveLength(1);                       // de-duplicated
    expect(ogTitles[0].value).toMatch(/Contact Us/);        // Helmet's value wins
    expect(snap.jsonLd).toEqual([]);                         // none from the shell
  });
});

describe("validateSnapshot", () => {
  const ok = { canonical: `${PROD}/refund-policy`, rootHtml: goodBody };
  it("accepts a correct snapshot", () => {
    expect(validateSnapshot("/refund-policy", ok, PROD)).toEqual([]);
    expect(validateSnapshot("/", { canonical: `${PROD}/`, rootHtml: goodBody }, PROD)).toEqual([]);
  });
  it("rejects the baked-in error screen", () => {
    const p = validateSnapshot("/our-plans", { canonical: `${PROD}/our-plans`, rootHtml: "<h1>Something went wrong</h1>" + goodBody }, PROD);
    expect(p.join()).toMatch(/error screen/);
  });
  it("rejects a missing or wrong canonical", () => {
    expect(validateSnapshot("/contact", { canonical: null, rootHtml: goodBody }, PROD).join()).toMatch(/no canonical/);
    expect(validateSnapshot("/contact", { canonical: `${PROD}/`, rootHtml: goodBody }, PROD).join()).toMatch(/expected/);
  });
  it("rejects an empty page", () => {
    expect(validateSnapshot("/contact", { canonical: `${PROD}/contact`, rootHtml: "" }, PROD).join()).toMatch(/empty/);
  });
});
