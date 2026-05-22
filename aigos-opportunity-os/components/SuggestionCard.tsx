"use client";

import { useState } from "react";
import Link from "next/link";
import type { OpportunitySuggestion } from "@/lib/types";
import { SuggestedEmail } from "./SuggestedEmail";
import { ManagerNote } from "./ManagerNote";
import { AddFollowUpDialog } from "./AddFollowUpDialog";
import { Icon } from "./icons";
import { confidenceLabel, formatMoney } from "@/lib/scoring";

export function SuggestionCard({
  suggestion,
}: {
  suggestion: OpportunitySuggestion;
}) {
  const s = suggestion;
  const [expanded, setExpanded] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);

  return (
    <div className="card card-hover p-4 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link
            href={`/contacts/${s.contactId}`}
            className="text-lg font-bold text-slate-100 hover:text-brand-pink"
          >
            {s.contactName}
          </Link>
          {s.company && (
            <p className="text-xs text-slate-500">{s.company}</p>
          )}
        </div>
        <div className="text-left">
          <div className="text-sm font-bold text-brand-purple">
            {s.confidenceScore}%
          </div>
          <div className="text-[11px] text-slate-500">
            {confidenceLabel(s.confidenceScore)}
          </div>
        </div>
      </div>

      {/* Why now */}
      <div className="mt-3 rounded-xl border border-brand-purple/25 bg-brand-soft p-3">
        <span className="section-title text-brand-pink">למה דווקא עכשיו</span>
        <p className="mt-1 text-sm text-slate-200">{s.whyNow}</p>
      </div>

      {/* Details grid */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Detail icon="sparkles" label="נושא לשיחה" value={s.topicToMention} />
        <Detail icon="briefcase" label="הצעה מוצעת" value={s.suggestedOffer} />
        <Detail
          icon="money"
          label="טווח מחיר מומלץ"
          value={s.suggestedPriceRange}
        />
        <Detail
          icon="clock"
          label="מחיר קודם"
          value={s.previousPrice ? formatMoney(s.previousPrice) : "אין רישום"}
        />
      </div>

      {/* Risk */}
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-3">
        <Icon
          name="alert"
          className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber"
        />
        <div>
          <span className="section-title text-accent-amber">
            הסיכון אם מתעלמים
          </span>
          <p className="mt-0.5 text-sm text-slate-200">{s.riskIfIgnored}</p>
        </div>
      </div>

      {/* Manager note */}
      <div className="mt-3">
        <ManagerNote compact>{s.managerNote}</ManagerNote>
      </div>

      {/* Suggested email */}
      {expanded && (
        <div className="mt-3">
          <SuggestedEmail
            email={s.suggestedEmailDraft}
            recipientName={s.contactName}
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="btn-ghost text-xs"
        >
          <Icon name="mail" className="h-3.5 w-3.5" />
          {expanded ? "הסתרת הטיוטה" : "טיוטת מייל"}
        </button>
        <button
          onClick={() => setFollowUpOpen(true)}
          className="btn-soft text-xs"
        >
          <Icon name="calendar" className="h-3.5 w-3.5" />
          הפיכה לפולואפ
        </button>
        <Link href={`/contacts/${s.contactId}`} className="btn-soft text-xs">
          <Icon name="user" className="h-3.5 w-3.5" />
          לכרטיס איש הקשר
        </Link>
      </div>

      <AddFollowUpDialog
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        contactId={s.contactId}
        contactName={s.contactName}
      />
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-soft/60 p-2.5">
      <span className="section-title flex items-center gap-1 text-slate-500">
        <Icon name={icon} className="h-3 w-3" />
        {label}
      </span>
      <p className="mt-1 text-sm text-slate-200">{value}</p>
    </div>
  );
}
