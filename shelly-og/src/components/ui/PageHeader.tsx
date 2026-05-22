import { Icon } from "./Icon";

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  /** איזור פעולות בצד הכותרת. */
  children?: React.ReactNode;
}

/** כותרת מסך אחידה. */
export function PageHeader({ icon, title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
          <Icon name={icon} className="size-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-ink-mute">{subtitle}</p>
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
