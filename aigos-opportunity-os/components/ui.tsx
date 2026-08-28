import { Icon } from "./icons";

/** Page title block. */
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}

/** A section heading with a count chip. */
export function SectionHeading({
  title,
  count,
  accent = "text-slate-200",
}: {
  title: string;
  count?: number;
  accent?: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className={`text-lg font-bold ${accent}`}>{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-ink-raised px-2 py-0.5 text-xs font-bold text-slate-300">
          {count}
        </span>
      )}
    </div>
  );
}

/** Friendly empty state. */
export function EmptyState({
  icon = "check",
  title,
  text,
}: {
  icon?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="card flex flex-col items-center p-8 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-ink-raised text-slate-500">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="font-semibold text-slate-200">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-400">{text}</p>}
    </div>
  );
}
