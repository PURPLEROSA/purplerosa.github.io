"use client";

import { useState } from "react";
import Link from "next/link";
import type { FollowUp } from "@/lib/types";
import { useStore } from "@/lib/store";
import { formatRelative, formatShortDate, isOverdue, isToday } from "@/lib/dateUtils";
import { formatMoney } from "@/lib/scoring";
import { createReminderEvent, reminderTitle } from "@/lib/calendarService";
import { SuggestedEmail } from "./SuggestedEmail";
import { ApprovalDialog } from "./ApprovalDialog";
import { Icon } from "./icons";

export function FollowUpCard({ followUp }: { followUp: FollowUp }) {
  const f = followUp;
  const {
    prices,
    getContact,
    markFollowUpDone,
    snoozeFollowUp,
    reactivateFollowUp,
    markFollowUpCalendarCreated,
    toast,
  } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const contact = getContact(f.contactId);
  const contactPrices = prices.filter((p) => p.contactId === f.contactId);
  const previousPrice =
    contactPrices.find((p) => p.priceCharged)?.priceCharged ??
    contactPrices[0]?.priceProposed;

  const overdue = isOverdue(f.dueDate) && f.status === "Pending";
  const today = isToday(f.dueDate);
  const done = f.status === "Done";
  const snoozed = f.status === "Snoozed";

  const confirmCalendar = async () => {
    const result = await createReminderEvent({
      contactName: f.contactName,
      topic: f.suggestedTopic || "פולואפ",
      date: f.dueDate,
      context: f.reason,
      suggestedNextStep: f.suggestedOffer,
      previousPrice: previousPrice ? formatMoney(previousPrice) : undefined,
      contactProfileUrl: `/contacts/${f.contactId}`,
    });
    markFollowUpCalendarCreated(f.id, result.eventId);
    toast(result.message, "success");
  };

  return (
    <div
      className={`card p-4 animate-fade-in ${
        overdue ? "border-accent-red/40" : ""
      } ${done ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link
            href={`/contacts/${f.contactId}`}
            className="font-bold text-slate-100 hover:text-brand-pink"
          >
            {f.contactName}
          </Link>
          {contact?.company && (
            <p className="text-xs text-slate-500">{contact.company}</p>
          )}
        </div>
        <span
          className={`chip ${
            overdue
              ? "border-accent-red/50 bg-accent-red/15 text-accent-red"
              : today
              ? "border-brand-orange/50 bg-brand-orange/15 text-brand-orange"
              : "border-ink-border bg-ink-raised text-slate-300"
          }`}
        >
          <Icon name="calendar" className="h-3 w-3" />
          {formatRelative(f.dueDate)} · {formatShortDate(f.dueDate)}
        </span>
      </div>

      {/* Why this matters */}
      <div className="mt-3 rounded-xl border border-accent-amber/25 bg-accent-amber/5 p-3">
        <span className="section-title text-accent-amber">למה זה חשוב</span>
        <p className="mt-1 text-sm text-slate-200">{f.reason}</p>
      </div>

      {/* What they asked + what to send */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <InfoBlock label="מה ביקשו" value={f.reminderText} />
        <InfoBlock
          label="מה לשלוח"
          value={f.suggestedOffer || f.suggestedTopic || "פולואפ קצר וענייני"}
        />
      </div>

      {previousPrice ? (
        <p className="mt-2 text-xs text-slate-400">
          <Icon name="money" className="ml-1 inline h-3.5 w-3.5" />
          מחיר קודם מול {f.contactName}: {formatMoney(previousPrice)}
        </p>
      ) : null}

      {/* Suggested email */}
      {expanded && f.suggestedEmailDraft && (
        <div className="mt-3">
          <SuggestedEmail
            email={f.suggestedEmailDraft}
            recipientName={f.contactName}
            recipientEmail={contact?.email}
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {f.suggestedEmailDraft && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="btn-ghost text-xs"
          >
            <Icon name="mail" className="h-3.5 w-3.5" />
            {expanded ? "הסתרת הטיוטה" : "טיוטת מייל"}
          </button>
        )}
        <button
          onClick={() => setCalendarOpen(true)}
          disabled={f.isCalendarCreated}
          className="btn-soft text-xs"
        >
          <Icon name="calendar" className="h-3.5 w-3.5" />
          {f.isCalendarCreated ? "תזכורת נוצרה" : "תזכורת ביומן"}
        </button>
        {!done && (
          <button
            onClick={() => markFollowUpDone(f.id)}
            className="btn-soft text-xs text-accent-green"
          >
            <Icon name="check" className="h-3.5 w-3.5" />
            סימון כבוצע
          </button>
        )}
        {snoozed || done ? (
          <button
            onClick={() => reactivateFollowUp(f.id)}
            className="btn-soft text-xs"
          >
            <Icon name="arrow" className="h-3.5 w-3.5" />
            החזרה לפעיל
          </button>
        ) : (
          <button
            onClick={() => snoozeFollowUp(f.id, 7)}
            className="btn-soft text-xs"
          >
            <Icon name="clock" className="h-3.5 w-3.5" />
            דחייה בשבוע
          </button>
        )}
      </div>

      <ApprovalDialog
        open={calendarOpen}
        title="אישור יצירת תזכורת ביומן"
        intro="עומדת להיווצר תזכורת פרטית ביומן Google שלך. זו תזכורת בשבילך בלבד — הלקוח/ה לא יוזמן/תוזמן."
        confirmLabel="כן, צרי תזכורת"
        onConfirm={confirmCalendar}
        onClose={() => setCalendarOpen(false)}
      >
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-slate-500">כותרת: </span>
            <span className="font-semibold text-slate-100">
              {reminderTitle({
                contactName: f.contactName,
                topic: f.suggestedTopic || "פולואפ",
                date: f.dueDate,
              })}
            </span>
          </p>
          <p>
            <span className="text-slate-500">תאריך: </span>
            <span className="text-slate-200">{formatShortDate(f.dueDate)}</span>
          </p>
          <p className="text-slate-300">{f.reason}</p>
        </div>
      </ApprovalDialog>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-soft/60 p-2.5">
      <span className="section-title text-slate-500">{label}</span>
      <p className="mt-1 text-sm text-slate-200">{value}</p>
    </div>
  );
}
