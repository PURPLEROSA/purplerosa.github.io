import type { Priority } from "@/lib/types";

const STYLES: Record<Priority, { cls: string; label: string }> = {
  Low: {
    cls: "border-slate-600 bg-slate-700/30 text-slate-300",
    label: "עדיפות נמוכה",
  },
  Medium: {
    cls: "border-accent-blue/40 bg-accent-blue/10 text-accent-blue",
    label: "עדיפות בינונית",
  },
  High: {
    cls: "border-brand-orange/40 bg-brand-orange/10 text-brand-orange",
    label: "עדיפות גבוהה",
  },
  Critical: {
    cls: "border-accent-red/50 bg-accent-red/15 text-accent-red",
    label: "קריטי",
  },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const s = STYLES[priority] ?? STYLES.Medium;
  return <span className={`chip ${s.cls}`}>{s.label}</span>;
}
