import { Helmet } from "react-helmet-async";
import siteConfig from "@/config/siteConfig";
import { useOptionalLanguage } from "@/hooks/useLanguage";
import { DEFAULT_LANGUAGE, LANGUAGES, getLanguageConfig } from "@/i18n/languages";
import type { SEOProps } from "@/types/components/SEO.types";
// Social/crawler images need a real raster size (not the 128px UI icon), and
// the large-image cards want a 1.91:1 shape, so this points at the dedicated
// 1200x630 share image.
const DEFAULT_IMAGE = `${siteConfig.productionUrl}${siteConfig.og_image}`;

/**
 * Sets the browser-tab title, canonical URL, and social/search meta tags
 * for a single page. Drop one <SEO .../> near the top of any page
 * component's JSX. `path` and either `title`+`description` are required
 * for every public page — see SEO.types.ts for what each prop controls.
 */
const SEO = ({ title, description, image, jsonLd, path, noindex, ogType = "website" }: SEOProps) => {
  const language = useOptionalLanguage()?.language ?? DEFAULT_LANGUAGE;
  const ogLocale = getLanguageConfig(language).ogLocale;
  const alternateLocales = LANGUAGES.filter((l) => l.code !== language).map((l) => l.ogLocale);
  const fullTitle = `${title} | ${siteConfig.title}`;
  const resolvedImage = image ?? DEFAULT_IMAGE;
  const canonicalUrl = `${siteConfig.productionUrl}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      <meta property="og:type" content={ogType} />
      {/* One URL serves every language (chosen client-side), so hreflang — which needs a distinct
          URL per language — is intentionally not emitted. og:locale tells social crawlers which
          language this render is in. See docs/I18N.md ("SEO") for the /hi/ URL upgrade path. */}
      <meta property="og:locale" content={ogLocale} />
      {alternateLocales.map((l) => (
        <meta key={l} property="og:locale:alternate" content={l} />
      ))}
      <meta property="og:site_name" content={siteConfig.companyName} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />
      {!image && <meta property="og:image:width" content="1200" />}
      {!image && <meta property="og:image:height" content="630" />}
      <meta property="og:image:alt" content={`${siteConfig.companyName} — ${siteConfig.description}`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
