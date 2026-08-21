import { test, expect } from "@playwright/test";

const AUTHENTICATED_USER = {
  id: "test-user-1",
  name: "Jordan Test",
  email: "jordan.test@example.com",
  role: "user",
  subscription: { status: "active" },
};

test.describe("Add record — validation", () => {
  test.beforeEach(async ({ page }) => {
    // AddRecord.tsx redirects to /login unless isAuthenticated() (i.e. a
    // `currentUser` entry exists in localStorage) — seed it before the
    // page's own script runs, via an init script rather than a page
    // navigation + localStorage.setItem, so it's present on first paint.
    await page.addInitScript((user) => {
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("auth_token", "fake-e2e-token");
    }, AUTHENTICATED_USER);
  });

  test("shows a destructive toast and focuses the Name field when saving with no name", async ({ page }) => {
    // await page.goto("/add-record");
    await page.goto("/add-record", { waitUntil: "domcontentloaded" }); // Temporarily change your beforeEach to

    await page.getByRole("button", { name: /save record/i }).click();

    await expect(
      page.getByText("Please enter the applicant's name", { exact: true })
    ).toBeVisible();

    const nameInput = page.locator("#name");
    await expect(nameInput).toHaveClass(/border-red-500/);
    await expect(nameInput).toBeFocused();
  });
});
