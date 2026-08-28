import Link from "next/link";
import { Icon } from "./icons";

type Accent = "pink" | "purple" | "orange" | "amber" | "green" | "blue";

const ACCENT: Record<Accent, { ring: string; text: string; chip: string }> = {
  pink: {
    ring: "hover:border-brand-pink/50",
    text: "text-brand-pink",
    chip: "bg-brand-pink/10 text-brand-pink",
  },
  purple: {
    ring: "hover:border-brand-purple/50",
    text: "text-brand-purple",
    chip: "bg-brand-purple/10 text-brand-purple",
  },
  orange: {
    ring: "hover:border-brand-orange/50",
    text: "text-brand-orange",
    chip: "bg-brand-orange/10 text-brand-orange",
  },
  amber: {
    ring: "hover:border-accent-amber/50",
    text: "text-accent-amber",
    chip: "bg-accent-amber/10 text-accent-amber",
  },
  green: {
    ring: "hover:border-accent-green/50",
    text: "text-accent-green",
    chip: "bg-accent-green/10 text-accent-green",
  },
  blue: {
    ring: "hover:border-accent-blue/50",
    text: "text-accent-blue",
    chip: "bg-accent-blue/10 text-accent-blue",
  },
};

interface DashboardCardProps {
  title: string;
  value: string | number;
  insight: string;
  icon: string;
  accent?: Accent;
  ctaLabel?: string;
  ctaHref?: string;
}

export function DashboardCard({
  title,
  value,
  insight,
  icon,
  accent = "purple",
  ctaLabel,
  ctaHref,
}: DashboardCardProps) {
  const a = ACCENT[accent];
  return (
    <div
      className={`card ${a.ring} flex flex-col p-4 transition-all duration-200 hover:shadow-glow`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="section-title text-slate-400">{title}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${a.chip}`}>
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>

      <div className={`text-3xl font-extrabold ${a.text}`}>{value}</div>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
        {insight}
      </p>

      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-200 hover:text-white"
        >
          {ctaLabel}
          <Icon name="arrow" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
