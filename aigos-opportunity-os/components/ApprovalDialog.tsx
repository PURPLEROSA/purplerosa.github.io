"use client";

import { useEffect } from "react";
import { Icon } from "./icons";

interface ApprovalDialogProps {
  open: boolean;
  title: string;
  intro: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
  tone?: "default" | "danger";
}

/**
 * A confirmation gate for every sensitive action.
 *
 * Nothing in this app sends an email or creates a calendar event without
 * the user passing through this dialog first.
 */
export function ApprovalDialog({
  open,
  title,
  intro,
  confirmLabel,
  onConfirm,
  onClose,
  children,
  tone = "default",
}: ApprovalDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="card relative z-10 w-full max-w-lg animate-fade-in p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`grid h-8 w-8 place-items-center rounded-lg ${
                tone === "danger"
                  ? "bg-accent-red/15 text-accent-red"
                  : "bg-brand-soft text-brand-pink"
              }`}
            >
              <Icon name="alert" className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-ink-raised hover:text-slate-200"
            aria-label="סגירה"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-3 text-sm leading-relaxed text-slate-300">{intro}</p>

        {children && (
          <div className="mb-4 max-h-72 overflow-y-auto rounded-xl border border-ink-border bg-ink-soft p-3">
            {children}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            שום דבר לא יקרה עד שתאשרי כאן.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-soft">
              ביטול
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="btn-primary"
            >
              <Icon name="check" className="h-4 w-4" />
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
