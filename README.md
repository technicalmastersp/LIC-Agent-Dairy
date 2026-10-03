# Policy Niketan — Insurance Records

A web application for LIC agents to manage policyholder records — capture
applicant details, track policy/premium due dates, monitor missed and
upcoming payments, and (for admins) oversee users, revenue, support
tickets, and subscriptions.

<!-- Replace <owner>/<repo> below with this repo's actual GitHub path once
     pushed — the badge can't be filled in automatically since no git
     remote or `repository` field in package.json is available here. -->
[![CI](https://github.com/<owner>/<repo>/actions/workflows/ci.yml/badge.svg)](https://github.com/<owner>/<repo>/actions/workflows/ci.yml)

[Live Demo ›](https://policyniketan.com/)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Commit & Deploy Process](#commit--deploy-process)
- [Deployment](#deployment)

---

## Tech Stack

- **Framework**: React 18 + TypeScript, built with Vite
- **Routing**: React Router v6
- **Styling / UI**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Data fetching**: Axios (`api/apiClient.js`) with a centralized
  response interceptor for auth/session handling; TanStack Query is
  installed and provider-wired for incremental adoption
- **Forms**: react-hook-form + zod are installed for incremental adoption;
  most forms currently use manual `useState`-based validation
- **Backend**: separate Node.js/Express/MongoDB API
  (`LIC-Agent-Dairy-Backend-development`) — not part of this repo
- **Hosting**: Vercel (SPA rewrite configured in `vercel.json`)

---

## Prerequisites

- Node.js 18+ and npm
- A running instance of the companion backend API
  (`LIC-Agent-Dairy-Backend-development`), or access to a deployed one

---

## Local Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd LIC-Agent-Dairy-devlopment

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# then edit .env — see "Environment Variables" below

# 4. Start the dev server
npm run dev
```

The app runs at `http://localhost:8080` by default (see `vite.config.ts`).

---

## Environment Variables

Copy `.env.example` to `.env` and set:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL of the backend API (e.g. `http://localhost:5000/api` locally, or the deployed backend URL in production). Read in `api/apiClient.js`. |
| `VITE_RAZORPAY_KEY_ID` | Yes, for subscription/payment flows | Razorpay publishable key used by the client-side checkout flow. |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional | Only needed if/when a Maps-dependent feature is enabled (currently commented out in `.env.example`). |

> **Note:** Vite only exposes environment variables prefixed with `VITE_`
> to client-side code — don't add `REACT_APP_`-prefixed variables, they
> won't be readable via `import.meta.env`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot module reload. |
| `npm run build` | Production build (mode: production) into `dist/`. Also copies prerendered page snapshots (see below) and regenerates `public/sitemap.xml` as part of the build. |
| `npm run build:dev` | Build in development mode (useful for staging/debug builds). |
| `npm run deploy:dev` | Builds (`build:dev`) and publishes `dist/` to the `gh-pages` branch. |
| `npm run lint` | Run ESLint across the project. |
| `npm run preview` | Locally preview the production build output. |
| `npm run test` | Run the Vitest test suite once (CI mode). |
| `npm run test:watch` | Run Vitest in watch mode while developing. |
| `npm run test:e2e` | Run the Playwright end-to-end suite (starts the dev server automatically). |
| `npm run sitemap:generate` | Regenerate `public/sitemap.xml` from `scripts/publicRoutes.mjs` by hand. Runs automatically as part of `npm run build` — only needed standalone if you want a fresh sitemap without a full build. |
| `npm run prerender:generate` | Regenerate the prerendered SEO snapshots in `prerendered/` (see [Commit & Deploy Process](#commit--deploy-process) — this one is **not** run automatically and needs a local Chromium). |

---

## Project Structure

```
src/
├── components/     # Reusable UI components (incl. shadcn/ui in components/ui)
├── pages/          # Route-level page components, incl. pages/admin and pages/tools
├── hooks/          # Custom React hooks
├── config/         # App-level configuration (site config, etc.)
├── utils/          # Auth helpers, formatters, local storage helpers, etc.
├── lib/            # Shared library utilities (e.g. cn() class merge helper)
├── App.tsx         # Route definitions and top-level providers
└── main.tsx        # App entry point

api/                # Axios client + interceptors
services/           # Per-domain API call wrappers (records, admin, users, etc.)
public/             # Static assets, robots.txt, sitemap.xml, logos
```

---

## Commit & Deploy Process

### On every commit (automatic, local)

A Husky pre-commit hook runs **lint-staged**, which runs `eslint --fix` on
whatever `.ts`/`.tsx` files you've staged (`.husky/pre-commit` →
`package.json`'s `"lint-staged"` key). This only touches staged files, is
auto-fixing, and does **not** run tests, type-checking, or a build — it's a
fast sanity check, not the full gate. Installed automatically by
`npm install` via the `"prepare": "husky"` script, so no manual setup is
needed after cloning.

### Before you push — run what CI will run

CI (see below) will fail the build if any of these fail, so run them
locally first to catch problems before they show up as a red PR check:

```bash
npm run lint                            # ESLint, whole project
npx tsc --noEmit -p tsconfig.app.json   # Type-check (see note below)
npm run test                            # Vitest unit tests
npm run build                           # Full production build
```

> **Why `-p tsconfig.app.json`:** the root `tsconfig.json` only has
> `"references"` and no `"files"`/`"include"` of its own, so
> `npx tsc --noEmit` with no `-p` flag silently type-checks zero files and
> always exits `0`. Pointing at `tsconfig.app.json` is what actually checks
> `src/`.

If you touched anything under `src/pages` that's a **public, unauthenticated**
route (see `scripts/publicRoutes.mjs`), also regenerate the prerendered SEO
snapshots and commit the result:

```bash
npm run prerender:generate
git add prerendered/
```

This one is **not** run in CI or in the Vercel build — it needs a real
Chromium (`@playwright/test`), which Vercel's build container can't launch.
It's local-only by design: run it on your machine after a public-page content
change, and commit `prerendered/` along with your other changes. (You do
**not** need to run `npm run sitemap:generate` by hand — that one *does* run
automatically as part of `npm run build`, both locally and on Vercel.)

### What CI checks (GitHub Actions)

`.github/workflows/ci.yml` runs on every push to `main` and every PR
targeting `main`, on Node 22:

1. `npm ci`
2. `npm run lint`
3. `npx tsc --noEmit -p tsconfig.app.json`
4. `npm run test`
5. `npm run build`

CI is a **check only** — it doesn't deploy anything itself. There's no
separate deploy step or secrets for that in this workflow.

### What actually deploys

Deployment is handled by **Vercel's own Git integration**, not by the
GitHub Actions workflow above — connecting this repo in the Vercel
dashboard is what triggers a deploy on push, independent of CI passing.
Standard Vercel behavior (confirm/adjust in the Vercel project's Git
settings if this repo is configured differently):

- Push to `main` → production deploy at `policyniketan.com`
- Push to any other branch / open a PR → a preview deployment at a unique
  `*.vercel.app` URL

Because CI and the Vercel deploy are two independent triggers watching the
same push, it's possible for a broken `main` to deploy on Vercel even if
the CI run for that same commit later goes red — CI here is a visibility
signal, not a merge/deploy gate, unless branch protection is separately
configured in GitHub to require it.

---

## Deployment

The app is deployed on **Vercel**. `vercel.json` handles three things:

1. **Canonical-domain redirects** — permanent redirects from the Vercel-assigned
   `*.vercel.app` domains and `www.policyniketan.com` to `https://policyniketan.com`,
   so the site is only ever indexed/linked under one canonical host.
2. **Rewrites** — `/api/:path*` is proxied straight through to the backend
   (`https://lic-agent-dairy-backend.onrender.com/api/:path*`), and everything
   else that isn't a real static file (`/assets/...` or anything containing a
   dot, e.g. `favicon.ico`) falls through to `/index.html` so React Router can
   handle client-side routing on direct loads and refreshes:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://lic-agent-dairy-backend.onrender.com/api/:path*" },
       { "source": "/((?!assets/|.*\\..*).*)", "destination": "/" }
     ]
   }
   ```
3. **Security headers** — a Content-Security-Policy plus `X-Frame-Options`,
   `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`,
   applied to every route.

Set `VITE_API_URL` and `VITE_RAZORPAY_KEY_ID` as environment variables in
the Vercel project settings, pointing at the production backend and live
Razorpay key respectively.
