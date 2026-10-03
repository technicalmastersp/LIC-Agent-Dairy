import { describe, it, expect } from "vitest";
import { convertDateToIndianFormat } from "./tools";

describe("convertDateToIndianFormat", () => {
  it("converts a valid ISO date to IST display format (no type arg)", () => {
    expect(convertDateToIndianFormat("2024-01-15T10:30:00.000Z")).toBe("15 Jan 2024");
  });

  it("returns a date-input value (YYYY-MM-DD) when a type arg is passed", () => {
    expect(convertDateToIndianFormat("2024-01-15T10:30:00.000Z", "iso")).toBe("2024-01-15");
  });

  it("returns an empty string for an empty input", () => {
    expect(convertDateToIndianFormat("")).toBe("");
  });

  it("returns an empty string for an undefined input", () => {
    // Record date fields (createdAt, dateOfBirth, lastPaymentDate, etc.)
    // are optional, so callers legitimately pass `undefined` here.
    expect(convertDateToIndianFormat(undefined)).toBe("");
  });

  it("returns an empty string for an unparseable date string", () => {
    expect(convertDateToIndianFormat("not-a-date")).toBe("");
  });

  it("re-formats an already-formatted date into the standard display format", () => {
    // "15-Jan-2024" is parseable by `new Date(...)`, so it is normalised to
    // the app-wide "DD Mon YYYY" display format.
    expect(convertDateToIndianFormat("15-Jan-2024")).toBe("15 Jan 2024");
  });

  it("normalises an already-formatted date to a date-input value when a type arg is passed", () => {
    expect(convertDateToIndianFormat("15-Jan-2024", "iso")).toBe("2024-01-15");
  });
});