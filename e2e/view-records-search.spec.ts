import { test, expect } from "@playwright/test";

const AUTHENTICATED_USER = {
  id: "test-user-1",
  name: "Jordan Test",
  email: "jordan.test@example.com",
  role: "user",
  subscription: { status: "active" },
};

// Minimal shape satisfying the fields ViewRecords actually reads (name,
// fatherName, occupation, aadhaarLinkedMobileNumber, currentPolicy.*,
// insuranceType) — irrelevant fields left blank.
const baseRecord = {
  aadhaarNumber: "",
  panNumber: "",
  email: "",
  birthPlace: "",
  fatherName: "Family Name",
  motherName: "",
  spouseName: "",
  address: "",
  dateOfBirth: "",
  age: "34",
  occupation: "Engineer",
  educationalQualification: "",
  designationOfPolicyHolder: "",
  annualIncome: "",
  periodOfService: "",
  employerName: "",
  aadhaarLinkedMobileNumber: "9876543210",
  nameOfNominee: "",
  ageOfNominee: "",
  relationName: "",
  lastChildBirthDate: "",
  height: "",
  weight: "",
  bankAccountNumber: "",
  ifscCode: "",
  bankName: "",
  branchName: "",
  currentPolicy: {
    policyNumber: "POL-0001",
    planAndTerm: "",
    sumAssured: "500000",
    modeOfPayment: "Yearly",
    branch: "Central Branch",
    lastPaymentDate: "",
  },
  previousPolicy: {
    policyNumber: "",
    planAndTerm: "",
    sumAssured: "",
    modeOfPayment: "",
    branch: "",
    lastPaymentDate: "",
  },
  createdAt: "2024-01-15T00:00:00.000Z",
  insuranceType: "Life Insurance",
};

const MOCK_RECORDS = [
  { ...baseRecord, recordId: "rec-1", name: "Zephyrine Okonkwo-Batra" },
  { ...baseRecord, recordId: "rec-2", name: "Ravi Kumar" },
  { ...baseRecord, recordId: "rec-3", name: "Priya Sharma" },
];

test.describe("View records — search", () => {
  // test.beforeEach(async ({ page }) => {
  //   await page.addInitScript((user) => {
  //     localStorage.setItem("currentUser", JSON.stringify(user));
  //     localStorage.setItem("auth_token", "fake-e2e-token");
  //   }, AUTHENTICATED_USER);

  //   await page.route("**/user/getAllPolicyRecords", async (route) => {
  //     await route.fulfill({ json: { records: MOCK_RECORDS } });
  //   });
  // });

  // --------------------------------------------------------------------------------
  // Temporarily change your beforeEach to:
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("auth_token", "fake-e2e-token");
    }, AUTHENTICATED_USER);

    page.on("request", (request) => {
      console.log("REQUEST:", request.method(), request.url());
    });

    page.on("response", async (response) => {
      console.log("RESPONSE:", response.status(), response.url());
    });

    await page.route("**/api/user/getAllPolicyRecords", async (route) => {
      console.log("MOCK MATCHED:", route.request().url());

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ records: MOCK_RECORDS }),
      });
    });
  });
  // --------------------------------------------------------------------------------

  test("typing a distinctive name filters the table to exactly one row", async ({ page }) => {
    // await page.goto("/view-records");
    await page.goto("/view-records", { waitUntil: "domcontentloaded" });

    // Wait for the unfiltered fetch to land — three rows visible.
    await expect(page.locator("table tbody tr")).toHaveCount(3);

    // "Zephyrine" matches only one of the three mock records.
    await page.getByPlaceholder("Search by name, policy number, occupation...").fill("Zephyrine");

    // Search is debounced (300ms) — assert with Playwright's built-in
    // auto-retrying expect rather than an explicit wait.
    await expect(page.locator("table tbody tr")).toHaveCount(1);
    await expect(page.locator("table tbody tr")).toContainText("Zephyrine Okonkwo-Batra");
  });
});
