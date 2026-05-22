"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

/** כפתור העתקה ללוח עם משוב ויזואלי. */
export function CopyButton({
  text,
  className,
  label = "העתקי",
}: {
  text: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard לא זמין — מתעלמים בשקט */
    }
  }

  return (
    <button
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink",
        copied && "border-lime/50 text-lime",
        className
      )}
    >
      <Icon name={copied ? "Check" : "Copy"} className="size-3.5" />
      {copied ? "הועתק" : label}
    </button>
  );
}
