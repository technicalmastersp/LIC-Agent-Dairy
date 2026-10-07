// Referral-program master switch (VITE_REFERRAL_PROGRAM_ENABLED), seen from the
// outside: render the real pages with the switch OFF and ON and check what a
// visitor — or a payment-gateway reviewer — would actually read.
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
  h.user = user;
  const { render, waitFor } = await import("@testing-library/react");
  const { LanguageProvider } = await import("@/hooks/useLanguage");
  const React = await import("react");
  const Page = (await import(/* @vite-ignore */ `../pages/${page}.tsx`)).default;
  render(
    React.createElement(LanguageProvider, null,
      React.createElement(MemoryRouter, null, React.createElement(Page))));
  // let mount effects (mocked API calls) settle
  await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(100));
  await new Promise((r) => setTimeout(r, 150));
  return document.body.textContent || "";
}

beforeEach(() => { document.body.innerHTML = ""; });
afterEach(() => { vi.unstubAllEnvs(); });

const PROGRAM_WORDS = /referral|wallet|commission|withdraw/i;

describe("switch OFF — visitor-facing pages never mention the program", () => {
  it.each(["Landing", "About", "SignUp"])("%s", async (page) => {
    const text = await show(false, page);
    expect(text).not.toMatch(PROGRAM_WORDS);
  });

  it("Our Plans — even for a logged-in user holding a wallet balance", async () => {
    const text = await show(false, "OurPlans", LOGGED_IN);
    expect(text).not.toMatch(PROGRAM_WORDS);
    expect(text).not.toMatch(/Use my referral wallet/i);
    expect(text).toMatch(/does not renew automatically/i);   // earlier fix still present
  });

  it("Home — no Referrals stat, no wallet card", async () => {
    const text = await show(false, "Home", LOGGED_IN);
    expect(text).not.toMatch(PROGRAM_WORDS);
  });

  it("Profile — no referral code, summary, or payout details (even with data present)", async () => {
    const text = await show(false, "Profile", LOGGED_IN);
    expect(text).not.toMatch(PROGRAM_WORDS);
    expect(text).not.toMatch(/payout/i);
  });
});

describe("switch OFF — help and legal pages tell the truth without advertising", () => {
  it("Help & Support: one explanatory FAQ, no referral category or wallet FAQs", async () => {
    const text = await show(false, "HelpSupport");
    expect(text).toMatch(/Is there a referral program\?/);
    expect(text).not.toMatch(/Payments & Referrals/);
    expect(text).not.toMatch(/wallet|commission|withdraw/i);
  });

  it("Terms: Section 7 says the program is not available; no earning/wallet terms", async () => {
    const text = await show(false, "TermsOfService");
    expect(text).toMatch(/Referral Program is currently not available/);
    expect(text).not.toMatch(/Use of Wallet Balance/);
    expect(text).not.toMatch(/RazorpayX/);
    expect(text).not.toMatch(/can earn referral/i);
  });

  it("Privacy: earlier-records wording, no RazorpayX, no 'optional payout details' collection", async () => {
    const text = await show(false, "PrivacyPolicy");
    expect(text).toMatch(/Earlier referral records/);
    expect(text).toMatch(/no longer collect new referral data/);
    expect(text).not.toMatch(/RazorpayX/);
  });
});

describe("switch ON — the program is fully restored", () => {
  it("Landing + About advertise it again", async () => {
    expect(await show(true, "Landing")).toMatch(/Referral wallet/);
    expect(await show(true, "About")).toMatch(/Referrals and wallet/);
  });
  it("SignUp shows the referral code field", async () => {
    await show(true, "SignUp");
    expect(document.querySelector("#referralCode")).not.toBeNull();
  });
  it("Our Plans offers the wallet again", async () => {
    expect(await show(true, "OurPlans", LOGGED_IN)).toMatch(/Use my referral wallet/);
  });
  it("Profile shows the referral code row", async () => {
    expect(await show(true, "Profile", LOGGED_IN)).toMatch(/Referral code/);
  });
  it("Home shows the wallet card", async () => {
    expect(await show(true, "Home", LOGGED_IN)).toMatch(/Referral wallet/);
  });
  it("Help + Terms are back to the full program wording", async () => {
    expect(await show(true, "HelpSupport")).toMatch(/How does the referral wallet work\?/);
    expect(await show(true, "TermsOfService")).toMatch(/Use of Wallet Balance/);
  });
});
