import { Loader2 } from "lucide-react";

/**
 * Full-viewport centered spinner used as the <Suspense> fallback while a
 * lazy-loaded route chunk downloads. Mirrors the Loader2 usage pattern
 * already used for in-page loading (see AdminLayout.tsx's nav loader).
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

export default PageLoader;
