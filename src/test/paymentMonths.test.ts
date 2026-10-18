import { describe, it, expect } from "vitest";
import { formatMonthKey, todayInputIST, currentMonthKeyIST, addMonthsToKey, formatRupees, fallbackMonthOptions } from "@/utils/paymentMonths";

describe("paymentMonths helpers", () => {
  it("formats month keys", () => {
    expect(formatMonthKey("2026-09")).toBe("Sep 2026");
    expect(formatMonthKey("2027-01")).toBe("Jan 2027");
    expect(formatMonthKey("garbage")).toBe("garbage");
  });
  it("uses the IST calendar day, not the device's", () => {
    // 20:00 UTC on 31 Oct is already 1 Nov 01:30 in India
    const lateUtc = new Date("2026-10-31T20:00:00.000Z");
    expect(todayInputIST(lateUtc)).toBe("2026-11-01");
    expect(currentMonthKeyIST(lateUtc)).toBe("2026-11");
    expect(todayInputIST(new Date("2026-10-31T10:00:00.000Z"))).toBe("2026-10-31");
  });
  it("adds months across year ends", () => {
    expect(addMonthsToKey("2026-11", 3)).toBe("2027-02");
    expect(addMonthsToKey("2026-01", -2)).toBe("2025-11");
  });
  it("formats rupees in Indian grouping", () => {
    expect(formatRupees(1234567)).toBe("₹12,34,567");
    expect(formatRupees(1200.5)).toBe("₹1,200.5");
    expect(formatRupees(null)).toBe("—");
  });
  it("fallback window is last 6 months + next month", () => {
    const opts = fallbackMonthOptions(new Date("2026-10-18T06:00:00.000Z"));
    expect(opts).toEqual(["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"]);
  });
});
