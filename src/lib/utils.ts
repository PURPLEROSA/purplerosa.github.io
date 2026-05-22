import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** מיזוג מחלקות Tailwind בצורה בטוחה. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const HE_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const HE_DAYS = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

/** תאריך עברי קריא — "22 במאי 2026". */
export function formatDateHe(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ב${HE_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** תאריך קצר — "22.5". */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()}.${d.getMonth() + 1}`;
}

/** שם יום בעברית. */
export function dayNameHe(iso: string): string {
  const d = new Date(iso);
  return HE_DAYS[d.getDay()];
}

/** מרחק זמן יחסי בעברית — "לפני 3 ימים", "מחר". */
export function relativeTimeHe(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays === 0) return "היום";
  if (diffDays === 1) return "מחר";
  if (diffDays === -1) return "אתמול";
  if (diffDays > 1 && diffDays <= 7) return `בעוד ${diffDays} ימים`;
  if (diffDays < -1 && diffDays >= -7) return `לפני ${Math.abs(diffDays)} ימים`;
  if (diffDays > 7) return `בעוד ${Math.ceil(diffDays / 7)} שבועות`;
  return `לפני ${Math.ceil(Math.abs(diffDays) / 7)} שבועות`;
}

/** מזהה ייחודי קצר. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** השהיה — לשימוש בסימולציית קריאות API. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
