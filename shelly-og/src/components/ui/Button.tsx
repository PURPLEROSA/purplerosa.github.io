"use client";

import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

type Variant = "primary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** שם אייקון lucide (אופציונלי). */
  icon?: string;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white hover:brightness-110 hover:shadow-glow",
  ghost:
    "border border-line-strong bg-surface-2 text-ink-soft hover:border-purple/50 hover:text-ink hover:bg-surface-3",
  subtle:
    "bg-surface-3 text-ink-soft hover:bg-surface-3/70 hover:text-ink",
  danger:
    "border border-pink/40 bg-pink/10 text-pink hover:bg-pink/20",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
};

/** כפתור אחיד למערכת. */
export function Button({
  variant = "primary",
  size = "md",
  icon,
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Icon name="Loader2" className="size-4 animate-spin" />
      ) : icon ? (
        <Icon name={icon} className={size === "sm" ? "size-3.5" : "size-4"} />
      ) : null}
      {children}
    </button>
  );
}
