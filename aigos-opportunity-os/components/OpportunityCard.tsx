"use client";

import { useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatRelative, formatShortDate } from "@/lib/dateUtils";
import { formatMoney, confidenceLabel } from "@/lib/scoring";
import { StatusBadge, TypeBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { FactsBox } from "./FactsBox";
import { SuggestedEmail } from "./SuggestedEmail";
import { AddFollowUpDialog } from "./AddFollowUpDialog";
import { AddPriceDialog } from "./AddPriceDialog";
import { Icon } from "./icons";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const o = opportunity;
  const { prices, markOpportunityHot, snoozeOpportunity, setOpportunityStatus, toast } =
    useStore();
  const [expanded, setExpanded] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const contactPrices = prices.filter((p) => p.contactId === o.contactId);
  const previousPrice =
    contactPrices.find((p) => p.priceCharged)?.priceCharged ??
    contactPrices[0]?.priceProposed;

  const closed = ["Won", "Lost", "Closed"].includes(o.status);

  const openGmail = () => {
    if (o.gmailThreadId && !o.gmailThreadId.startsWith("thread-")) {
      window.open(
        `https://mail.google.com/mail/u/0/#all/${o.gmailThreadId}`,
        "_blank",
      );
    } else {
      toast(
        "במצב דמו אין שרשור Gmail אמיתי. בחיבור אמיתי הכפתור יקפיץ אותך ישר לשרשור.",
        "info",
      );
    }
  };

  return (
    <div
      className={`card card-hover p-4 ${closed ? "opacity-60" : ""} animate-fade-in`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/contacts/${o.contactId}`}
            className="text-lg font-bold text-slate-100 hover:text-brand-pink"
          >
            {o.contactName}
          </Link>
          <p className="text-sm text-slate-400">
            {o.company ? `${o.company} · ` : ""}
            {o.email}
          </p>
        </div>
        <div className="text-left">
          <div className="text-sm font-bold text-brand-purple">
            {o.confidenceScore}%
          </div>
          <div className="text-[11px] text-slate-500">
            {confidenceLabel(o.confidenceScore)}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        <TypeBadge type={o.type} />
        <StatusBadge status={o.status} />
        <PriorityBadge priority={o.priority} />
      </div>

      {/* Summary */}
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{o.summary}</p>

      {/* Meta row */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <Meta
          icon="clock"
          label="קשר אחרון"
          value={o.lastContactDate ? formatShortDate(o.lastContactDate) : "—"}
        />
        <Meta
          icon="calendar"
          label="פולואפ הבא"
          value={
            o.nextFollowUpDate ? formatRelative(o.nextFollowUpDate) : "לא נקבע"
          }
        />
        <Meta
          icon="money"
          label="מחיר קודם"
          value={previousPrice ? formatMoney(previousPrice) : "אין רישום"}
        />
      </div>

      {/* Suggested next step */}
      <div className="mt-3 rounded-xl border border-brand-purple/25 bg-brand-soft p-3">
        <span className="section-title text-brand-pink">הצעד הבא</span>
        <p className="mt-1 text-sm text-slate-200">{o.suggestedNextStep}</p>
        {o.estimatedValue ? (
          <p className="mt-1.5 text-xs text-slate-400">
            שווי משוער: {formatMoney(o.estimatedValue)}
          </p>
        ) : null}
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="mt-3 space-y-3">
          <FactsBox facts={o.facts} assumptions={o.aiAssumptions} />
          {o.suggestedEmailDraft && (
            <SuggestedEmail
              email={o.suggestedEmailDraft}
              recipientName={o.contactName}
              recipientEmail={o.email}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="btn-ghost text-xs"
        >
          <Icon name="mail" className="h-3.5 w-3.5" />
          {expanded ? "הסתרת פרטים" : "טיוטת תשובה ופירוט"}
        </button>
        <button
          onClick={() => setFollowUpOpen(true)}
          className="btn-soft text-xs"
        >
          <Icon name="calendar" className="h-3.5 w-3.5" />
          הוספת פולואפ
        </button>
        <button
          onClick={() => markOpportunityHot(o.id)}
          className="btn-soft text-xs text-accent-red"
        >
          <Icon name="fire" className="h-3.5 w-3.5" />
          סימון כחם
        </button>
        <button
          onClick={() => setPriceOpen(true)}
          className="btn-soft text-xs"
        >
          <Icon name="money" className="h-3.5 w-3.5" />
          רישום מחיר
        </button>
        <button
          onClick={() => snoozeOpportunity(o.id, 7)}
          className="btn-soft text-xs"
        >
          <Icon name="clock" className="h-3.5 w-3.5" />
          דחייה
        </button>
        {!closed && (
          <button
            onClick={() => {
              setOpportunityStatus(o.id, "Closed");
              toast("ההזדמנות נסגרה. אם זה הצעד הנכון — יופי.", "info");
            }}
            className="btn-soft text-xs"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
            סגירה
          </button>
        )}
        <button onClick={openGmail} className="btn-soft text-xs">
          <Icon name="external" className="h-3.5 w-3.5" />
          פתיחת שרשור
        </button>
      </div>

      <AddFollowUpDialog
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        contactId={o.contactId}
        contactName={o.contactName}
        email={o.email}
        opportunityId={o.id}
      />
      <AddPriceDialog
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        contactId={o.contactId}
        contactName={o.contactName}
        company={o.company}
        defaultService={o.serviceOffered}
      />
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-ink-border bg-ink-soft/60 px-2.5 py-1.5">
      <Icon name={icon} className="h-3.5 w-3.5 text-slate-500" />
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500">{label}</div>
        <div className="truncate text-xs font-semibold text-slate-200">
          {value}
        </div>
      </div>
    </div>
  );
}
