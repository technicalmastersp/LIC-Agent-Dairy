import { describe, it, expect } from "vitest";
import { dedupeRecords, type Record } from "./ViewRecords";

// All the fields below are required by the Record interface but irrelevant
// to dedupeRecords' logic (it only reads recordId/_id) — filled with
// placeholder values so TypeScript is happy, then overridden per test.
const createMockRecord = (overrides: Partial<Record>): Record => ({
  id: "id-1",
  date: "2024-01-01",
  aadhaarNumber: "",
  panNumber: "",
  email: "",
  name: "Test User",
  birthPlace: "",
  fatherName: "",
  motherName: "",
  spouseName: "",
  address: "",
  dateOfBirth: "",
  age: "30",
  occupation: "",
  educationalQualification: "",
  designationOfPolicyHolder: "",
  annualIncome: "",
  periodOfService: "",
  employerName: "",
  aadhaarLinkedMobileNumber: "",
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
    policyNumber: "POL-1",
    planAndTerm: "",
    sumAssured: "",
    modeOfPayment: "",
    branch: "",
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
  createdAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

describe("dedupeRecords", () => {
  it("leaves a list with no duplicates unchanged", () => {
    const records = [
      createMockRecord({ recordId: "r1", name: "Alice" }),
      createMockRecord({ recordId: "r2", name: "Bob" }),
      createMockRecord({ recordId: "r3", name: "Carol" }),
    ];

    const result = dedupeRecords(records);

    expect(result).toHaveLength(3);
    expect(result).toEqual(records);
  });

  it("collapses records with the same recordId, keeping the first occurrence", () => {
    const first = createMockRecord({ recordId: "dup", name: "First (kept)" });
    const second = createMockRecord({ recordId: "dup", name: "Second (dropped)" });
    const third = createMockRecord({ recordId: "unique", name: "Unrelated" });

    const result = dedupeRecords([first, second, third]);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("First (kept)");
    expect(result.map((r) => r.name)).not.toContain("Second (dropped)");
  });

  it("falls back to _id, then a JSON fingerprint, for records missing recordId", () => {
    // Two records share an _id but have no recordId -> deduped via _id.
    const sameMongoId = [
      createMockRecord({ recordId: undefined, _id: "mongo-1", name: "Kept" }),
      createMockRecord({ recordId: undefined, _id: "mongo-1", name: "Dropped" }),
    ];
    expect(dedupeRecords(sameMongoId)).toHaveLength(1);
    expect(dedupeRecords(sameMongoId)[0].name).toBe("Kept");

    // Two records with neither recordId nor _id, but genuinely different
    // content -> fall back to a JSON fingerprint, so both survive.
    const noIdsAtAll = [
      createMockRecord({ recordId: undefined, _id: undefined, name: "Distinct A" }),
      createMockRecord({ recordId: undefined, _id: undefined, name: "Distinct B" }),
    ];
    expect(dedupeRecords(noIdsAtAll)).toHaveLength(2);

    // Two records with neither recordId nor _id and identical content ->
    // the JSON fingerprint is identical too, so they collapse to one.
    const identicalNoIds = [
      createMockRecord({ recordId: undefined, _id: undefined, name: "Same" }),
      createMockRecord({ recordId: undefined, _id: undefined, name: "Same" }),
    ];
    expect(dedupeRecords(identicalNoIds)).toHaveLength(1);
  });
});
