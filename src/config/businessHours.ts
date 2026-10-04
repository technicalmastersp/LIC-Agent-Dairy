// Single source of truth (frontend) for when the team places call-back calls.
// Mirrors config/businessHours.js in the BACKEND repo — the two repos can't
// share a file, so change BOTH together (same convention as siteConfig).
//
// All times are Indian Standard Time (IST, UTC+05:30, no daylight saving).
// Days: 0 = Sunday … 6 = Saturday. open/close are minutes after IST midnight.

interface DayWindow { open: number; close: number }

export const BUSINESS_HOURS = {
  utcOffsetMinutes: 330,
  schedule: {
    0: { open: 10 * 60, close: 20 * 60 },
    1: { open: 9 * 60,  close: 21 * 60 },
    2: { open: 9 * 60,  close: 21 * 60 },
    3: { open: 9 * 60,  close: 21 * 60 },
    4: { open: 9 * 60,  close: 21 * 60 },
    5: { open: 9 * 60,  close: 21 * 60 },
    6: { open: 10 * 60, close: 20 * 60 },
  } as Record<number, DayWindow | null>,
  holidays: [] as string[], // "YYYY-MM-DD" (IST)
  lastRequestBufferMinutes: 30,
};

// Shown on Help & Support, Contact, About and in the request-a-call dialog.
export const BUSINESS_HOURS_LABELS: { days: string; hours: string }[] = [
  { days: "Monday – Friday",   hours: "9:00 AM – 9:00 PM" },
  { days: "Saturday – Sunday", hours: "10:00 AM – 8:00 PM" },
];

export const BUSINESS_HOURS_SUMMARY = "Mon–Fri 9 AM – 9 PM · Sat–Sun 10 AM – 8 PM (IST)";

/** Is the team taking calls right now? Only used for a friendly "open now" badge —
 *  the server decides the real call time when a request is submitted. */
export const isTeamAvailableNow = (now: Date = new Date()): boolean => {
  const s = new Date(now.getTime() + BUSINESS_HOURS.utcOffsetMinutes * 60_000);
  const ymd = `${s.getUTCFullYear()}-${String(s.getUTCMonth() + 1).padStart(2, "0")}-${String(s.getUTCDate()).padStart(2, "0")}`;
  if (BUSINESS_HOURS.holidays.includes(ymd)) return false;
  const win = BUSINESS_HOURS.schedule[s.getUTCDay()];
  if (!win) return false;
  const minutes = s.getUTCHours() * 60 + s.getUTCMinutes();
  return minutes >= win.open && minutes < win.close - BUSINESS_HOURS.lastRequestBufferMinutes;
};
