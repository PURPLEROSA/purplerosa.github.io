"use client";

import { useMemo } from "react";
import { mockEmails } from "@/lib/mockData";
import { classifyEmail } from "@/lib/aiService";
import { typeLabel } from "./StatusBadge";
import { Modal } from "./Modal";
import { Icon } from "./icons";

/**
 * Demo of the Gmail -> opportunity pipeline. Runs classifyEmail() on the
 * mock inbox and shows what the system detected, with full transparency.
 */
export function GmailScanDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const results = useMemo(
    () =>
      mockEmails.map((email) => ({
        email,
        result: classifyEmail(email),
      })),
    [],
  );

  const relevant = results.filter(
    (r) => r.result.opportunityType !== "Not Relevant",
  ).length;

  return (
    <Modal
      open={open}
      title="סריקת Gmail (מצב דמו)"
      subtitle={`נסרקו ${mockEmails.length} מיילים · ${relevant} זוהו כהזדמנויות`}
      onClose={onClose}
      footer={
        <button onClick={onClose} className="btn-primary">
          הבנתי
        </button>
      }
    >
      <div className="space-y-2">
        {results.map(({ email, result }) => {
          const notRelevant = result.opportunityType === "Not Relevant";
          return (
            <div
              key={email.id}
              className={`rounded-xl border p-3 ${
                notRelevant
                  ? "border-ink-border bg-ink-soft/40 opacity-70"
                  : "border-brand-purple/25 bg-ink-soft"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {email.subject}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {email.fromName} · {email.date}
                  </p>
                </div>
                <span
                  className={`chip shrink-0 ${
                    notRelevant
                      ? "border-slate-600 bg-slate-700/30 text-slate-400"
                      : "border-brand-purple/30 bg-brand-soft text-slate-200"
                  }`}
                >
                  {typeLabel(result.opportunityType)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Icon name="sparkles" className="h-3 w-3" />
                  ביטחון {result.confidenceScore}%
                </span>
                {result.needsUserApproval && (
                  <span className="flex items-center gap-1 text-accent-amber">
                    <Icon name="alert" className="h-3 w-3" />
                    דורש בדיקה ידנית
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        בחיבור אמיתי ל-Gmail, ההזדמנויות שאושרו יישמרו אוטומטית ל-Google Sheets.
      </p>
    </Modal>
  );
}
