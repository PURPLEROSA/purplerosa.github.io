// =====================================================================
// Date helpers. All "today" math is done in the browser's local time.
// =====================================================================

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight today, local time. */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Parse an ISO string to a Date at local midnight (date-only comparison). */
export function parseDay(iso: string | undefined | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** ISO date string (YYYY-MM-DD). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole days from today to the given date. Negative = in the past. */
export function daysFromToday(iso: string | undefined | null): number | null {
  const day = parseDay(iso);
  if (!day) return null;
  return Math.round((day.getTime() - startOfToday().getTime()) / DAY_MS);
}

export function isOverdue(iso: string | undefined | null): boolean {
  const diff = daysFromToday(iso);
  return diff !== null && diff < 0;
}

export function isToday(iso: string | undefined | null): boolean {
  return daysFromToday(iso) === 0;
}

export function isThisWeek(iso: string | undefined | null): boolean {
  const diff = daysFromToday(iso);
  return diff !== null && diff > 0 && diff <= 7;
}

export function isWithin(
  iso: string | undefined | null,
  fromDays: number,
  toDays: number,
): boolean {
  const diff = daysFromToday(iso);
  return diff !== null && diff >= fromDays && diff <= toDays;
}

/** Human Hebrew date, e.g. "22 במאי 2026". */
export function formatDate(iso: string | undefined | null): string {
  const d = iso ? new Date(iso) : null;
  if (!d || isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Short Hebrew date, e.g. "22.5.26". */
export function formatShortDate(iso: string | undefined | null): string {
  const d = iso ? new Date(iso) : null;
  if (!d || isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  }).format(d);
}

/** Relative Hebrew phrase, e.g. "מחר", "לפני 3 ימים", "בעוד 5 ימים". */
export function formatRelative(iso: string | undefined | null): string {
  const diff = daysFromToday(iso);
  if (diff === null) return "—";
  if (diff === 0) return "היום";
  if (diff === 1) return "מחר";
  if (diff === -1) return "אתמול";
  if (diff > 1) return `בעוד ${diff} ימים`;
  return `לפני ${Math.abs(diff)} ימים`;
}
