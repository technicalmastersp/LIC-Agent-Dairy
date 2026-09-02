
export interface SEOProps {
  /** Page-specific title. " | Life Insurance Records" is appended automatically. */
  title: string;
  /** Page-specific meta description (also used for og:description). */
  description: string;
  /** Absolute image URL for og:image/twitter:image. Defaults to the site logo. */
  image?: string;
  /** Optional schema.org structured data, rendered as a JSON-LD <script> tag. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
