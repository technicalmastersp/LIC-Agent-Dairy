import { formatISTDate, toDateInputValue } from "./dateFormat";

// Kept as a thin wrapper (rather than migrating 25+ call sites across 8
// files) so every existing caller gets the fix for free. This used to:
//  1. build its own Intl.DateTimeFormat with no explicit timeZone, so the
//     displayed date silently depended on the viewer's device, not a
//     guaranteed IST rendering;
//  2. output dash-separated dates ("05-Sep-2026") while every other date
//     formatter in the app (13+ separately-duplicated ones) used spaces
//     ("05 Sep 2026") — two different formats for the same thing, now
//     unified to the space-separated style everywhere;
//  3. in its `type` branch, do date.split("T")[0] — which recovers the
//     *UTC* calendar date, silently off by a day for any stored instant
//     in the 00:00–05:29 IST window (still "yesterday" in UTC).
export const convertDateToIndianFormat = (date: string | undefined, type?: string) => {
    if (!date) return '';
    return type ? toDateInputValue(date) : formatISTDate(date);
};