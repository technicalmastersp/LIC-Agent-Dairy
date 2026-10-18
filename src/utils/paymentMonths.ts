import type { MonthStatus } from "@/types/components/PaymentHistory.types";

// Helpers shared by the Record Payment and Payment History modals.

const IST = "Asia/Kolkata";

// Fixed table, not Intl: ICU versions disagree ("Sep" vs "Sept" for en-IN), and a
// month label shouldn't change spelling between browsers.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09" → "Sep 2026" */
export const formatMonthKey = (key: string): string => {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(key);
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : key;
};

/** Today's calendar date in IST as "YYYY-MM-DD" (what <input type="date"> uses). */
export const todayInputIST = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);

/** Current month in IST as "YYYY-MM". */
export const currentMonthKeyIST = (now: Date = new Date()): string => todayInputIST(now).slice(0, 7);

export const addMonthsToKey = (key: string, n: number): string => {
  const [y, m] = key.split("-").map(Number);
  const i = y * 12 + (m - 1) + n;
  return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`;
};

/** ₹1,23,456.50 — whole rupees drop the decimals. */
export const formatRupees = (n: number | null | undefined): string =>
  n === null || n === undefined || Number.isNaN(n)
    ? "—"
    : `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const STATUS_LABEL: Record<MonthStatus, string> = {
  paid: "Paid", missed: "Missed", due: "Due this month", upcoming: "Upcoming",
};

export const STATUS_CHIP: Record<MonthStatus, string> = {
  paid:     "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  missed:   "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  due:      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  upcoming: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700",
};

/**
 * Month choices when a policy has no payment information at all (nothing to build a
 * schedule from): the last 6 months plus next month, oldest first.
 */
export const fallbackMonthOptions = (now: Date = new Date()): string[] => {
  const cur = currentMonthKeyIST(now);
  return Array.from({ length: 7 }, (_, i) => addMonthsToKey(cur, i - 5));
};
