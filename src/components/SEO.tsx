import { Helmet } from "react-helmet-async";
import siteConfig from "@/config/siteConfig";
import type { SEOProps } from "@/types/components/SEO.types";
// Social/crawler images need a real raster size (not the 128px UI icon),
// so this points at the dedicated 512x512 social asset.
const DEFAULT_IMAGE = `${siteConfig.productionUrl}${siteConfig.logo_social}`;

/**
 * Sets the browser-tab title, canonical URL, and social/search meta tags
 * for a single page. Drop one <SEO .../> near the top of any page
 * component's JSX. `path` and either `title`+`description` are required
 * for every public page — see SEO.types.ts for what each prop controls.
 */
const SEO = ({ title, description, image, jsonLd, path, noindex, ogType = "website" }: SEOProps) => {
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
      <meta property="og:site_name" content={siteConfig.companyName} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />

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
