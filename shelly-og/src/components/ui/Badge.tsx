import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

export type BadgeTone =
  | "purple"
  | "pink"
  | "orange"
  | "electric"
  | "lime"
  | "mute";

const TONES: Record<BadgeTone, string> = {
  purple: "bg-purple/15 text-purple-soft border-purple/30",
  pink: "bg-pink/15 text-pink border-pink/30",
  orange: "bg-orange/15 text-orange border-orange/30",
  electric: "bg-electric/15 text-electric border-electric/30",
  lime: "bg-lime/15 text-lime border-lime/30",
  mute: "bg-white/5 text-ink-mute border-line",
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: string;
  className?: string;
  children: React.ReactNode;
}

/** תווית סטטוס / סיווג קטנה. */
export function Badge({ tone = "mute", icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold leading-tight",
        TONES[tone],
        className
      )}
    >
      {icon && <Icon name={icon} className="size-3" />}
      {children}
    </span>
  );
}
