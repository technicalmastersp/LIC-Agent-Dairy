// Single source of truth for date display, date-input handling, and
// calendar-date validation across the whole app.
//
// Before this existed, ~15 files each defined their own local `fmt`/
// `fmtTime` date formatter (all named `fmt`, all nearly identical, all
// independently copy-pasted) — none of them passed an explicit `timeZone`
// to Intl.DateTimeFormat, so the displayed day/hour silently depended on
// whichever device/browser was viewing the page, not a single guaranteed
// IST rendering. `Asia/Kolkata` below is what actually forces IST
// regardless of viewer location — the `en-IN` locale alone (used
// everywhere before this) only changes month/day *ordering conventions*,
// not the timezone used to compute the date at all.
//
// MongoDB/BSON Date fields are always stored as UTC instants internally —
// that's a property of the database engine, not something an application
// can opt out of. What this module guarantees instead is that *display*
// is always, consistently IST, and that date-only fields (dateOfBirth,
// lastPaymentDate) are parsed/validated the same way everywhere so the
// calendar day itself never silently shifts.
const IST_TIMEZONE = "Asia/Kolkata";

function toDate(input: string | Date | undefined | null): Date | null {
  if (!input) return null;
  const d = typeof input === "string" ? new Date(input) : input;
  return d instanceof Date && !isNaN(d.getTime()) ? d : null;
}

/** Date-only display — "05 Sep 2026". Replaces every file's local `fmt`
 * and utils/tools.ts's convertDateToIndianFormat. */
export function formatISTDate(input: string | Date | undefined | null): string {
  const d = toDate(input);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: IST_TIMEZONE,
  }).format(d);
}

/** Date + time display — "05 Sep 2026, 03:45 PM". Replaces every file's
 * local `fmtTime`/datetime `fmt` (activity logs, sessions, admin logs). */
export function formatISTDateTime(input: string | Date | undefined | null): string {
  const d = toDate(input);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: IST_TIMEZONE,
  }).format(d);
}

/** Full display — "Monday, 05 September 2026" — for the one-off "today's
 * date" banner on Home.tsx. */
export function formatISTFullDate(input: string | Date | undefined | null = new Date()): string {
  const d = toDate(input);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: IST_TIMEZONE,
  }).format(d);
}

/** "September 2026" — for MissedPayments.tsx's month/year label. */
export function formatISTMonthYear(input: string | Date | undefined | null = new Date()): string {
  const d = toDate(input);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: IST_TIMEZONE,
  }).format(d);
}

/**
 * YYYY-MM-DD for populating <input type="date"> when editing an existing
 * record — computed as the calendar date *in IST*, not by naively
 * splitting an ISO string on "T" (which recovers the UTC calendar date,
 * silently off by one day for any stored instant that falls between
 * 00:00–05:29 IST, since that's still the previous day in UTC).
 */
export function toDateInputValue(input: string | Date | undefined | null): string {
  const d = toDate(input);
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: IST_TIMEZONE,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * True calendar validity, not just "matches YYYY-MM-DD shape". JS's Date
 * constructor silently rolls invalid dates over (e.g. "2023-02-30"
 * becomes March 2nd) rather than rejecting them. Native
 * <input type="date"> can't produce an invalid date through its own UI,
 * but anything reaching a date field via paste, autofill, direct API
 * calls, or (see excelImport.ts) a spreadsheet cell, can — so every date
 * field in the app should run through this before being accepted.
 */
export function isValidCalendarDate(str: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
