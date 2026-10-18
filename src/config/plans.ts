// Plan ids that exist on the backend (utils/ourSubscriptionPlans.js) — used to build and validate
// "?plan=" links so a stale or tampered URL can never select a plan that doesn't exist.
export const PLAN_IDS = ["1month-free", "1month", "3months", "6months", "12months"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const isValidPlanId = (value: unknown): value is PlanId =>
  typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);

/** Link to the signup page with this plan pre-selected (falls back to plain /signup). */
export const signupPathForPlan = (planId: string): string =>
  isValidPlanId(planId) ? `/signup?plan=${encodeURIComponent(planId)}` : "/signup";
