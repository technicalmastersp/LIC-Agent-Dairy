import { test, expect } from "@playwright/test";

test.describe("Sign up", () => {
  test("fills the form with valid data and completes signup on the free plan", async ({ page }) => {
    // getReferralConfig() runs on mount (useEffect) — mock it so the page
    // doesn't wait on/fail from a real network call.
    await page.route("**/referral/config/referral", async (route) => {
      await route.fulfill({
        json: {
          data: {
            SIGNUP_DISCOUNT_AMOUNT: 100,
            L1_COMMISSION_PCT: 5,
            L2_COMMISSION_PCT: 2,
          },
        },
      });
    });

    // createUser() — the actual submit call. Free plan means no payment
    // step, so a plain success object routes straight to /login.
    await page.route("**/auth/register", async (route) => {
      await route.fulfill({
        json: {
          user: {
            id: "test-user-1",
            name: "Jordan Test",
            email: "jordan.test@example.com",
            subscription: { status: "active" },
          },
        },
      });
    });

    // await page.goto("/signup");
    await page.goto("/signup", { waitUntil: "domcontentloaded" }); // Temporarily change your beforeEach to

    await page.locator("#name").fill("Jordan Test");
    await page.locator("#mobileNumber").fill("9876543210");
    await page.locator("#fullAddress").fill("221B Test Street, Testville");
    await page.locator("#email").fill("jordan.test@example.com");

    // Password satisfies all three strength requirements: 6+ chars, one
    // uppercase, one number.
    await page.locator("#password").fill("Passw0rd");
    await page.locator("#confirmPassword").fill("Passw0rd");

    // All three strength checks should flip to satisfied (green) once a
    // valid password is entered.
    await expect(page.getByText("At least 6 characters")).toHaveClass(/text-green-600/);
    await expect(page.getByText("One uppercase letter")).toHaveClass(/text-green-600/);
    await expect(page.getByText("One number")).toHaveClass(/text-green-600/);

    // Plan selection — a shadcn/Radix Select, not a native <select>.
    await page.getByRole("combobox").filter({ hasText: /Select Subscription Plan/i }).click();
    await page.getByRole("option", { name: /1 Month Free Plan/i }).click();

    // Confirms the plan-selection step actually rendered and registered
    // a choice before submitting.
    await expect(page.getByRole("combobox").filter({ hasText: /1 Month Free Plan/i })).toBeVisible();

    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
