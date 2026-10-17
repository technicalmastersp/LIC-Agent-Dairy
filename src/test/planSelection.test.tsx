// "Click a plan → signup opens with THAT plan selected", from the home page and from /our-plans,
// plus the home page's plan cards and stats band. Real pages, real router, real clicks.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/hooks/useLanguage";
import Landing from "@/pages/Landing";
import SignUp from "@/pages/SignUp";
import OurPlans from "@/pages/OurPlans";
import { PLAN_IDS } from "@/config/plans";
import { HOME_STATS, SITE_STATS, formatStat } from "@/config/siteStats";

vi.setConfig({ testTimeout: 30_000 });

(globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
Element.prototype.scrollIntoView ??= vi.fn();
Element.prototype.hasPointerCapture ??= vi.fn(() => false);
Element.prototype.releasePointerCapture ??= vi.fn();

const h = vi.hoisted(() => ({ user: null as Record<string, unknown> | null }));
vi.mock("@/utils/auth", () => ({ getCurrentUser: () => h.user, setCurrentUser: vi.fn(), isAuthenticated: () => !!h.user }));
vi.mock("@/components/Navigation", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/components/SEO", () => ({ default: () => null }));
vi.mock("recharts", () => { const N = () => null; return { ResponsiveContainer: N, LineChart: N, Line: N, XAxis: N, YAxis: N, CartesianGrid: N, Tooltip: N, Legend: N }; });
vi.mock("../../services/configService", () => ({ getReferralConfig: vi.fn(() => Promise.resolve({ SIGNUP_DISCOUNT_AMOUNT: 100, L1_COMMISSION_PCT: 5, L2_COMMISSION_PCT: 2 })) }));
vi.mock("../../services/referralService", () => ({ getReferralDashboard: vi.fn(() => Promise.resolve(null)), lookupIfsc: vi.fn() }));
vi.mock("../../services/userService", () => ({ createUser: vi.fn(), checkReferralCode: vi.fn(), getProfile: vi.fn(() => Promise.resolve({})) }));
vi.mock("../../services/subscriptionService", () => ({
  createCheckoutOrder: vi.fn(), verifyPayment: vi.fn(), changePlan: vi.fn(), getSubscription: vi.fn(() => Promise.resolve(null)),
}));

const app = (initial: string) =>
  render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/our-plans" element={<OurPlans />} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>
  );

// The plan Select on the signup page (the only combobox there).
const planSelect = () => screen.getByRole("combobox");

beforeEach(() => { h.user = null; document.body.innerHTML = ""; });

describe("home page — plans section", () => {
  it("shows ALL five plans, including the paid 1-month Starter plan that used to be missing", () => {
    const { container } = app("/");
    const section = container.querySelector("#plans") as HTMLElement;
    const hrefs = Array.from(section.querySelectorAll("a[href^='/signup']")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(PLAN_IDS.map((id) => `/signup?plan=${id}`));          // 5 cards, in catalogue order
    expect(within(section).getByText("1 Month Free")).toBeInTheDocument();
    expect(within(section).getByText("Pay month to month")).toBeInTheDocument();
    expect(within(section).getByText("3 Months")).toBeInTheDocument();
    expect(within(section).getByText("6 Months")).toBeInTheDocument();
    expect(within(section).getByText("12 Months")).toBeInTheDocument();
  });

  it("the two 1-month cards are distinguishable (no two cards share the same name)", () => {
    const { container } = app("/");
    const names = Array.from((container.querySelector("#plans") as HTMLElement).querySelectorAll("p.text-sm.font-medium")).map((p) => p.textContent);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("home page — stats band reads the single source of truth", () => {
  it("renders every stat from src/config/siteStats.ts", () => {
    app("/");
    for (const { key, value, label } of HOME_STATS) {
      const cell = screen.getByTestId(`home-stat-${key}`);
      expect(cell).toHaveTextContent(value);
      expect(cell).toHaveTextContent(label);
    }
    expect(screen.getByTestId("home-stat-agents")).toHaveTextContent(formatStat(SITE_STATS.agentsJoined));
    expect(screen.getByTestId("home-stat-records")).toHaveTextContent(formatStat(SITE_STATS.recordsManaged));
  });
});

describe("clicking a plan on the home page → signup has that plan selected", () => {
  it.each([
    ["1month-free", "1 Month Free Plan"],
    ["1month", "1 Month Plan"],
    ["3months", "3 Months Plan"],
    ["6months", "6 Months Plan"],
    ["12months", "12 Months Plan"],
  ])("%s", async (id, label) => {
    const user = userEvent.setup();
    const { container } = app("/");
    await user.click(container.querySelector(`#plans a[href="/signup?plan=${id}"]`) as HTMLElement);
    await waitFor(() => expect(planSelect()).toHaveTextContent(label));
  });
});

describe("signup page — reading ?plan=", () => {
  it("preselects a valid plan from the URL", async () => {
    app("/signup?plan=6months");
    await waitFor(() => expect(planSelect()).toHaveTextContent("6 Months Plan"));
  });
  it("ignores an unknown plan (nothing preselected, no crash)", async () => {
    app("/signup?plan=platinum-forever");
    await waitFor(() => expect(planSelect()).toBeInTheDocument());
    expect(planSelect()).not.toHaveTextContent(/\d+ Months? (Free )?Plan/);
  });
  it.each(["__proto__", "constructor", "<script>alert(1)</script>", ""])("ignores hostile value %j", async (v) => {
    app(`/signup?plan=${encodeURIComponent(v)}`);
    await waitFor(() => expect(planSelect()).toBeInTheDocument());
    expect(planSelect()).not.toHaveTextContent(/\d+ Months? (Free )?Plan/);
  });
  it("with no ?plan= the choice stays empty (unchanged behaviour)", async () => {
    app("/signup");
    await waitFor(() => expect(planSelect()).toBeInTheDocument());
    expect(planSelect()).not.toHaveTextContent(/\d+ Months? (Free )?Plan/);
  });
  it("the user can still change the preselected plan by hand", async () => {
    const user = userEvent.setup();
    app("/signup?plan=3months");
    await waitFor(() => expect(planSelect()).toHaveTextContent("3 Months Plan"));
    await user.click(planSelect());
    await user.click(await screen.findByRole("option", { name: /12 Months Plan/ }));
    await waitFor(() => expect(planSelect()).toHaveTextContent("12 Months Plan"));
  });
});

describe("/our-plans (logged out) → signup with the clicked plan", () => {
  it("clicking 'Select Plan' on a plan opens signup with that exact plan chosen", async () => {
    const user = userEvent.setup();
    app("/our-plans");
    const buttons = await screen.findAllByRole("button", { name: /Select Plan/i });
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    // Find the 6-month card by its own heading, then click the button inside that card.
    const heading = screen.getAllByText(/6 Months?/i).find((el) => el.closest("[class*='rounded']")?.querySelector("button"));
    const card = heading!.closest("[class*='rounded']") as HTMLElement;
    await user.click(within(card).getByRole("button", { name: /Select Plan/i }));
    await waitFor(() => expect(planSelect()).toHaveTextContent(/6 Months Plan/));
  });
});
