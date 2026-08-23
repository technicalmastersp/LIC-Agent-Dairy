import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
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
}));
