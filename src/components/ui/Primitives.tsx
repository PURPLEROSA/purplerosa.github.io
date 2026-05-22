import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import type { Urgency } from "@/lib/types";

/* ---------- צ'יפ / תגית קטנה ---------- */
export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-ink-mute",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------- פס התקדמות ---------- */
export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/7", className)}>
      <div
        className="h-full rounded-full bg-brand-gradient transition-all"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

/* ---------- נקודת דחיפות ---------- */
const URGENCY_COLOR: Record<Urgency, string> = {
  low: "bg-ink-mute",
  medium: "bg-orange",
  high: "bg-pink",
  critical: "bg-pink animate-pulse-dot",
};

export function UrgencyDot({ urgency }: { urgency: Urgency }) {
  return (
    <span
      className={cn("inline-block size-2 rounded-full", URGENCY_COLOR[urgency])}
    />
  );
}

/* ---------- נתון סטטיסטי ---------- */
export function Stat({
  label,
  value,
  icon,
  tone = "purple",
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: "purple" | "pink" | "orange" | "electric";
}) {
  const toneClass = {
    purple: "text-purple-soft",
    pink: "text-pink",
    orange: "text-orange",
    electric: "text-electric",
  }[tone];
  return (
    <div className="so-card flex items-center gap-3 p-4">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5",
          toneClass
        )}
      >
        <Icon name={icon} className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-xl font-bold text-ink">{value}</div>
        <div className="truncate text-xs text-ink-mute">{label}</div>
      </div>
    </div>
  );
}

/* ---------- מצב ריק ---------- */
export function EmptyState({
  icon = "Inbox",
  title,
  description,
}: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-12 text-center">
      <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-white/5 text-ink-mute">
        <Icon name={icon} className="size-7" />
      </div>
      <p className="font-display font-bold text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-mute">{description}</p>
      )}
    </div>
  );
}

/* ---------- שורת מטא (תווית: ערך) ---------- */
export function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="shrink-0 font-semibold text-ink-mute">{label}:</span>
      <span className="text-ink-soft">{children}</span>
    </div>
  );
}
