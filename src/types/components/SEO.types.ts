
export interface SEOProps {
  /** Page-specific title. " | Policy Niketan" is appended automatically. */
  title: string;
  /** Page-specific meta description (also used for og:description). */
  description: string;
  /** Absolute image URL for og:image/twitter:image. Defaults to the site logo. */
  image?: string;
  /** Optional schema.org structured data, rendered as a JSON-LD <script> tag. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /**
   * Path (from the site root, e.g. "/our-plans") used to build the canonical
   * URL and og:url. Required for every public/indexable page — search
   * engines treat a missing canonical as a signal of low page quality and
   * it's the #1 cause of duplicate-content issues on sites reachable via
   * multiple query-string variants of the same URL.
   */
  path: string;
  /**
   * Set true for pages that must never appear in search results (auth
   * flows, error pages, anything gated behind login). Emits
   * <meta name="robots" content="noindex, nofollow"> instead of the
   * default "index, follow".
   */
  noindex?: boolean;
  /** Open Graph content type. Defaults to "website"; use "article" for blog/guide-style content. */
  ogType?: "website" | "article";
}

