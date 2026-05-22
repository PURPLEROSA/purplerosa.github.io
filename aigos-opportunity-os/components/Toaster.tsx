"use client";

import { useStore } from "@/lib/store";
import { Icon } from "./icons";
import type { ToastTone } from "@/lib/store";

const TONE: Record<ToastTone, { cls: string; icon: string }> = {
  info: { cls: "border-accent-blue/40 bg-ink-card", icon: "sparkles" },
  success: { cls: "border-accent-green/40 bg-ink-card", icon: "check" },
  warning: { cls: "border-accent-amber/45 bg-ink-card", icon: "alert" },
};

export function Toaster() {
  const { toasts, dismissToast } = useStore();

  return (
    <div className="fixed bottom-4 left-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((t) => {
        const tone = TONE[t.tone];
        return (
          <div
            key={t.id}
            className={`card flex items-start gap-2.5 border ${tone.cls} p-3 shadow-card animate-fade-in`}
          >
            <span className="mt-0.5 text-brand-pink">
              <Icon name={tone.icon} className="h-4 w-4" />
            </span>
            <p className="flex-1 text-sm leading-snug text-slate-200">
              {t.message}
            </p>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-slate-500 hover:text-slate-300"
              aria-label="סגירה"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
