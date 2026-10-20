// Hindi mirror of referralSwitch.test.tsx. The English suite proves the referral program is
// invisible when switched off; this proves the HINDI strings honour the same gate (a translated
// string that mentions रेफ़रल/वॉलेट in an un-gated place would be a compliance regression), and that
// the pages really render in Devanagari instead of silently falling back to English.
//
// Each case resets the module registry, stubs the env var, and imports React
// Testing Library AND the page fresh, so they share one React copy and the
// build-time flag is re-evaluated (several pages read it at module load).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

// Each case re-imports the whole page graph (that is how the build-time flag is
// re-evaluated), and the first one — Landing — pays the cold-start cost of
// loading every dependency. That can exceed vitest's default 5 s on a slower
// machine, so give these tests room.
vi.setConfig({ testTimeout: 30_000 });

// jsdom has no ResizeObserver; Radix UI (the signup checkbox) needs one.
(globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };

// jsdom doesn't implement <canvas>. BusinessCard (rendered on Landing and
// Profile) calls getContext("2d") and simply returns when it gets null, so
// returning null keeps it quiet instead of logging "Not implemented" errors.
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

const h = vi.hoisted(() => ({ user: null as Record<string, unknown> | null }));

vi.mock("@/utils/auth", () => ({
  getCurrentUser: () => h.user,
  setCurrentUser: vi.fn(),
  isAuthenticated: () => !!h.user,
}));
vi.mock("@/components/Navigation", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("recharts", () => {
  const Null = () => null;
  return { ResponsiveContainer: Null, LineChart: Null, Line: Null, XAxis: Null, YAxis: Null, CartesianGrid: Null, Tooltip: Null, Legend: Null };
});
vi.mock("../../services/configService", () => ({
  getReferralConfig: vi.fn(() => Promise.resolve({ SIGNUP_DISCOUNT_AMOUNT: 100, L1_COMMISSION_PCT: 5, L2_COMMISSION_PCT: 2, MIN_WITHDRAWAL: 500, REWARD_WINDOW_DAYS: 45 })),
}));
vi.mock("../../services/referralService", () => ({
  getReferralDashboard: vi.fn(() => Promise.resolve({ availableBalance: 500, pendingEarnings: 0, totalEarned: 500, totalL1: 2, totalL2: 1, withdrawalsEnabled: false })),
  lookupIfsc: vi.fn(),
}));
vi.mock("../../services/userService", () => ({
  getProfile: vi.fn(() => Promise.resolve({ name: "T", userPersonalInfo: [] })),
  createUser: vi.fn(), checkReferralCode: vi.fn(), completeOnboarding: vi.fn(),
  // Profile page, on mount:
  getMySessions: vi.fn(() => Promise.resolve(null)),
  getNotificationPreferences: vi.fn(() => Promise.resolve(null)),
  getMyActivity: vi.fn(() => Promise.resolve(null)),
  updateProfile: vi.fn(), updateProfileImage: vi.fn(), removeProfileImage: vi.fn(),
  revokeSession: vi.fn(), revokeOtherSessions: vi.fn(), updateNotificationPreferences: vi.fn(),
  logoutCurrentUser: vi.fn(),
}));
vi.mock("../../services/subscriptionService", () => ({
  createCheckoutOrder: vi.fn(), verifyPayment: vi.fn(), changePlan: vi.fn(),
  getSubscription: vi.fn(() => Promise.resolve(null)),
}));
vi.mock("../../services/recordService", () => ({
  dueThisMonth: vi.fn(() => Promise.resolve({ totalDue: 0, month: "Oct" })),
  dueNextMonth: vi.fn(() => Promise.resolve({ totalDue: 0 })),
  getMonthlyTrend: vi.fn(() => Promise.resolve([])),
  getRecordsWithoutLastPayment: vi.fn(() => Promise.resolve({ total: 0 })),
}));
vi.mock("../../services/supportService", () => ({ createTicket: vi.fn(), getMyTickets: vi.fn(() => Promise.resolve([])) }));
vi.mock("../../services/suggestionService", () => ({ createSuggestion: vi.fn(), getMySuggestions: vi.fn(() => Promise.resolve([])) }));

const LOGGED_IN = {
  name: "Test Agent", easyId: "EZ1", role: "user", referralCode: "ABC123",
  userPersonalInfo: [{ name: "Test Agent", subscription: { status: "active", planId: "1month", planType: "Starter", endDate: "2099-01-01", startDate: "2026-01-01", price: 249 } }],
  subscription: { status: "active", planId: "1month", planType: "Starter", endDate: "2099-01-01", startDate: "2026-01-01", price: 249 },
};

async function show(flag: boolean, page: string, user: Record<string, unknown> | null = null) {
  vi.resetModules();
  vi.stubEnv("VITE_REFERRAL_PROGRAM_ENABLED", flag ? "true" : "");
  localStorage.setItem("language", "hi");
  h.user = user;
  const { render, waitFor } = await import("@testing-library/react");
  const { LanguageProvider } = await import("@/hooks/useLanguage");
  const React = await import("react");
  const Page = (await import(/* @vite-ignore */ `../pages/${page}.tsx`)).default;
  render(
    React.createElement(LanguageProvider, null,
      React.createElement(MemoryRouter, null, React.createElement(Page))));
  // let mount effects (mocked API calls) settle
  // Hindi pack loads lazily before the provider renders children.
  await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(100), { timeout: 8000 });
  await new Promise((r) => setTimeout(r, 150));
  return document.body.textContent || "";
}

beforeEach(() => { document.body.innerHTML = ""; localStorage.clear(); });
afterEach(() => { vi.unstubAllEnvs(); localStorage.clear(); });

const PROGRAM_WORDS_HI = /रेफ़रल|रेफरल|वॉलेट|कमीशन|निकासी|referral|wallet|commission|withdraw/i;
const devanagariShare = (s: string) => {
  const letters = s.match(/\p{L}/gu) || [];
  return letters.length ? (s.match(/[\u0900-\u097F]/g) || []).length / letters.length : 0;
};

describe("Hindi, switch OFF — visitor-facing pages never mention the program", () => {
  it.each(["Landing", "About", "SignUp"])("%s", async (page) => {
    const text = await show(false, page);
    expect(text).not.toMatch(PROGRAM_WORDS_HI);
    expect(devanagariShare(text), `${page} should be predominantly Hindi`).toBeGreaterThan(0.5);
  });

  it("Our Plans — even for a logged-in user holding a wallet balance", async () => {
    const text = await show(false, "OurPlans", LOGGED_IN);
    expect(text).not.toMatch(PROGRAM_WORDS_HI);
    expect(devanagariShare(text)).toBeGreaterThan(0.4);
  });

  it("Home — no referral stat or wallet card", async () => {
    const text = await show(false, "Home", LOGGED_IN);
    expect(text).not.toMatch(PROGRAM_WORDS_HI);
    expect(devanagariShare(text)).toBeGreaterThan(0.5);
  });

  it("Profile — no referral code, summary or payout details", async () => {
    const text = await show(false, "Profile", LOGGED_IN);
    expect(text).not.toMatch(PROGRAM_WORDS_HI);
    expect(text).not.toMatch(/पेआउट/);
    expect(devanagariShare(text)).toBeGreaterThan(0.4);
  });
});

describe("Hindi, switch ON — the program is shown (proves the OFF assertions are not vacuous)", () => {
  it("Home shows the referral card in Hindi", async () => {
    const text = await show(true, "Home", LOGGED_IN);
    expect(text).toMatch(/रेफ़रल/);
  });
});

describe("Hindi login page", () => {
  it("renders translated headings and form labels", async () => {
    const text = await show(false, "Login");
    expect(text).toMatch(/लॉग इन/);
    expect(text).toMatch(/पासवर्ड/);
  });
});
