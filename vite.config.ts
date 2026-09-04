import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // VITE_API_URL historically pointed at the full API base *including* the
  // /api prefix (e.g. https://.../api) — strip that suffix here since the
  // proxy below forwards the /api/* path itself; keeping it would double up
  // into /api/api/*. Falls back to the same Onrender URL vercel.json's
  // production rewrite points at, so dev works even with no .env set.
  const backendOrigin = (
    env.VITE_API_URL || "https://lic-agent-dairy-backend.onrender.com/api"
  ).replace(/\/api\/?$/, "");

  return {
  base: '/',
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Mirrors vercel.json's "/api/:path* -> Onrender" rewrite for local
      // dev. Without this, apiClient.js's baseURL: "/api" resolves to
      // localhost:8080/api/*, which nothing is listening on outside of
      // Vercel — this is what broke local API calls after the same-origin
      // cookie fix. changeOrigin rewrites the Host header to match the
      // target so the backend doesn't see "localhost" as the request host.
      "/api": {
        target: backendOrigin,
        changeOrigin: true,
        secure: true,
        // The source file api/apiClient.js sits at the project root, so
        // Vite's dev server serves it (unbundled, dev-only) at the exact
        // URL path /api/apiClient.js — colliding with this proxy rule,
        // which otherwise swallows it and tries forwarding it to Onrender
        // instead of letting Vite serve your own code. Real backend routes
        // (e.g. /api/auth/login) never end in a file extension, so bypass
        // hands anything that looks like a JS/TS module request back to
        // Vite's own server instead of proxying it.
        bypass: (req) => {
          if (/\.(js|mjs|jsx|ts|tsx|map)(\?.*)?$/.test(req.url || "")) {
            return req.url;
          }
        },
      },
    },
  },
  plugins: [
    react(),
    // Emits dist/stats.html (gitignored, build-output only) with a
    // treemap of what's contributing to bundle size. Doesn't run in dev.
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      template: "treemap",
    }),
    VitePWA({
      // "generateSW" (not injectManifest) is the right strategy here — we're
      // not writing custom service-worker logic, just precaching the static
      // build output, so we don't need a hand-written SW file.
      strategy: "generateSW",
      registerType: "autoUpdate",
      // Adds the manifest <link> and registers the SW automatically — no
      // manual <link rel="manifest"> or navigator.serviceWorker.register()
      // call needed anywhere in index.html or main.tsx.
      injectRegister: "auto",
      manifest: {
        name: "Life Insurance Records",
        short_name: "LIC Records",
        description: "Professional life insurance policy record management system for agents and customers",
        start_url: "/",
        scope: "/",
        display: "standalone",
        // Matches --background (light theme, index.css) and --primary
        // converted from HSL to hex, so the OS splash screen and browser
        // chrome match the app's actual theme instead of a guessed color.
        background_color: "#FFFFFF",
        theme_color: "#0A5B76",
        orientation: "portrait",
        icons: [
          { src: "/pwa-icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa-icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          // Separate maskable icon (solid background, logo inset to the
          // ~70% safe zone) — required for Android adaptive icons to not
          // clip the logo when the OS applies a circle/squircle mask.
          { src: "/pwa-icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Precache only the built static assets (JS/CSS/HTML/fonts/images
        // from the Vite build output) — this is what "offline app shell"
        // means here. Deliberately NOT caching API responses: this app's
        // policy records, dues, and payment data change too often and are
        // too sensitive for a naive cache-first/stale-while-revalidate
        // strategy to be safe. No runtimeCaching entries are added for
        // /api/* — those requests continue to hit the network exactly as
        // they do today and simply fail normally (existing offline-toast
        // handling in apiClient.js) when there's no connection.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        // logo_medium_size.png (2.83MB) is a social/marketing asset, not
        // part of the app shell — nothing in the UI renders it at that
        // size. Precaching it would blow past workbox's 2MB default
        // per-file limit and bloat the offline cache for no benefit; raising
        // the limit to accommodate it would just paper over an asset that
        // should be compressed anyway (see the separate image-optimization
        // pass for public/logos).
        globIgnores: ["logos/logo_medium_size.png"],
        // Vite emits hashed filenames per build, so a fresh deploy always
        // gets a new precache manifest — cleanupOutdatedCaches prevents
        // stale precached assets from a previous deploy lingering forever.
        cleanupOutdatedCaches: true,
        // SPA fallback so deep links (e.g. /view-records opened directly
        // while offline after the first visit) still serve index.html
        // instead of a browser network-error page.
        navigateFallback: "/index.html",
        // Never let the SW intercept API calls or the SPA fallback would
        // incorrectly serve index.html for a failed /api/* request instead
        // of letting axios's real error handling run.
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        // Off in dev by default — a service worker intercepting requests
        // during local development makes HMR and debugging confusing. Can
        // be flipped to true temporarily to test PWA install-ability
        // locally, but should stay false for normal `npm run dev` use.
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    // Playwright's e2e/*.spec.ts files use test.describe() from
    // @playwright/test, which is not a Vitest suite — without this
    // exclusion `vitest run` picks them up and fails immediately.
    exclude: ["**/node_modules/**", "**/dist/**", "e2e/**"],
  },
  };
});