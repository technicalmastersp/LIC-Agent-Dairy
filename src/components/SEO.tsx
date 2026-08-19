import { Helmet } from "react-helmet-async";
import siteConfig from "@/config/siteConfig";

interface SEOProps {
  /** Page-specific title. " | Life Insurance Records" is appended automatically. */
  title: string;
  /** Page-specific meta description (also used for og:description). */
  description: string;
  /** Absolute image URL for og:image/twitter:image. Defaults to the site logo. */
  image?: string;
}

const DEFAULT_IMAGE = `${siteConfig.productionUrl}${siteConfig.logo_medium_size}`;

/**
 * Sets the browser-tab title and social/search meta tags for a single page.
 * Drop one <SEO .../> near the top of any page component's JSX.
 */
const SEO = ({ title, description, image }: SEOProps) => {
  const fullTitle = `${title} | ${siteConfig.title}`;
  const resolvedImage = image ?? DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
    </Helmet>
  );
};

export default SEO;
