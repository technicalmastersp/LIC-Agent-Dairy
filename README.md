# LIC Agent Diary — Life Insurance Records

A web application for LIC agents to manage policyholder records — capture
applicant details, track policy/premium due dates, monitor missed and
upcoming payments, and (for admins) oversee users, revenue, support
tickets, and subscriptions.

[Live Demo ›](https://lic-agent-dairy.vercel.app/)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
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
| `npm run build` | Production build (mode: production) into `dist/`. |
| `npm run build:dev` | Build in development mode (useful for staging/debug builds). |
| `npm run deploy:dev` | Builds (`build:dev`) and publishes `dist/` to the `gh-pages` branch. |
| `npm run lint` | Run ESLint across the project. |
| `npm run preview` | Locally preview the production build output. |
| `npm run test` | Run the Vitest test suite once (CI mode). |
| `npm run test:watch` | Run Vitest in watch mode while developing. |
| `npm run test:e2e` | Run the Playwright end-to-end suite (starts the dev server automatically). |

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

## Deployment

The app is deployed on **Vercel**. `vercel.json` rewrites all routes to
`/index.html` so client-side routing (React Router) works correctly on
direct page loads and refreshes:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Set `VITE_API_URL` and `VITE_RAZORPAY_KEY_ID` as environment variables in
the Vercel project settings, pointing at the production backend and live
Razorpay key respectively.
