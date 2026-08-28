"use client";

import { useState } from "react";
import type { SuggestedEmail as SuggestedEmailType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { ApprovalDialog } from "./ApprovalDialog";
import { Icon } from "./icons";

interface SuggestedEmailProps {
  email: SuggestedEmailType;
  recipientName?: string;
  recipientEmail?: string;
  /** Hide the "create draft" action (e.g. read-only previews). */
  readOnly?: boolean;
}

/**
 * Shows a ready-to-review email draft. Creating a Gmail draft always
 * goes through the approval dialog. Email is NEVER sent automatically.
 */
export function SuggestedEmail({
  email,
  recipientName,
  recipientEmail,
  readOnly = false,
}: SuggestedEmailProps) {
  const { toast } = useStore();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${email.subject}\n\n${email.body}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("לא הצלחתי להעתיק. אפשר לסמן ידנית.", "warning");
    }
  };

  const confirmDraft = () => {
    toast(
      "טיוטה הוכנה. במצב דמו היא לא נשמרת ב-Gmail — ובכל מקרה, לא נשלחת.",
      "success",
    );
  };

  return (
    <div className="rounded-xl border border-ink-border bg-ink-soft p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="section-title flex items-center gap-1.5 text-slate-400">
          <Icon name="mail" className="h-3.5 w-3.5" />
          טיוטת מייל מוצעת
        </span>
        <span className="chip border-ink-border bg-ink-raised text-[11px] text-slate-400">
          לא נשלח אוטומטית
        </span>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm">
          <span className="text-slate-500">נושא: </span>
          <span className="font-semibold text-slate-100">{email.subject}</span>
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
          {email.body}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={copy} className="btn-soft text-xs">
          <Icon name={copied ? "check" : "edit"} className="h-3.5 w-3.5" />
          {copied ? "הועתק" : "העתקת הטקסט"}
        </button>
        {!readOnly && (
          <button onClick={() => setOpen(true)} className="btn-ghost text-xs">
            <Icon name="mail" className="h-3.5 w-3.5" />
            יצירת טיוטה ב-Gmail
          </button>
        )}
      </div>

      <ApprovalDialog
        open={open}
        title="אישור יצירת טיוטה"
        intro={`עומדת להיווצר טיוטת מייל${
          recipientName ? ` ל${recipientName}` : ""
        }. הטיוטה תחכה לך לבדיקה — היא לא תישלח בלי שתשלחי אותה בעצמך.`}
        confirmLabel="כן, צרי טיוטה"
        onConfirm={confirmDraft}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-1 text-sm">
          {recipientEmail && (
            <p>
              <span className="text-slate-500">אל: </span>
              <span className="text-slate-200">{recipientEmail}</span>
            </p>
          )}
          <p>
            <span className="text-slate-500">נושא: </span>
            <span className="font-semibold text-slate-100">
              {email.subject}
            </span>
          </p>
          <p className="whitespace-pre-line text-slate-300">{email.body}</p>
        </div>
      </ApprovalDialog>
    </div>
  );
}
