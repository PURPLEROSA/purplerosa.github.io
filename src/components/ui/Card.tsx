import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** מדגיש את הכרטיס בטבעת זוהר — לפריטים חשובים. */
  glow?: boolean;
  /** אינטראקטיבי — אפקט hover. */
  interactive?: boolean;
}

/** כרטיס בסיס — מעוגל, כהה, מואר. */
export function Card({
  glow,
  interactive,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "so-card p-5",
        glow && "so-glow-border",
        interactive &&
          "cursor-pointer transition-all hover:border-purple/40 hover:bg-surface-2 hover:shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** כותרת בתוך כרטיס — אייקון + טקסט. */
export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("font-display text-base font-bold text-ink", className)}>
      {children}
    </h3>
  );
}
