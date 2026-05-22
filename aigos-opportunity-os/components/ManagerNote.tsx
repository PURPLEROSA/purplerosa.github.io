import { Icon } from "./icons";

type Tone = "default" | "warning" | "calm";

const TONE: Record<Tone, string> = {
  default: "border-brand-purple/30 bg-brand-soft",
  warning: "border-accent-amber/40 bg-accent-amber/10",
  calm: "border-ink-border bg-ink-raised/60",
};

interface ManagerNoteProps {
  children: React.ReactNode;
  tone?: Tone;
  compact?: boolean;
}

/**
 * The voice of the system - your tough-but-useful personal manager.
 */
export function ManagerNote({
  children,
  tone = "default",
  compact = false,
}: ManagerNoteProps) {
  return (
    <div
      className={`rounded-xl border ${TONE[tone]} ${
        compact ? "p-3" : "p-4"
      } animate-fade-in`}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-gradient text-white">
          <Icon name="sparkles" className="h-3.5 w-3.5" />
        </span>
        <span className="section-title text-brand-pink">המנהלת אומרת</span>
      </div>
      <p
        className={`leading-relaxed text-slate-200 ${
          compact ? "text-sm" : "text-[15px]"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
