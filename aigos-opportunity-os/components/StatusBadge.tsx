import type { OpportunityStatus, OpportunityType } from "@/lib/types";

const STATUS_STYLES: Record<
  OpportunityStatus,
  { cls: string; label: string }
> = {
  New: { cls: "border-accent-blue/40 bg-accent-blue/10 text-accent-blue", label: "חדש" },
  Open: { cls: "border-slate-600 bg-slate-700/30 text-slate-300", label: "פתוח" },
  "Waiting for Me": {
    cls: "border-brand-orange/40 bg-brand-orange/10 text-brand-orange",
    label: "מחכה לי",
  },
  "Waiting for Client": {
    cls: "border-slate-600 bg-slate-700/30 text-slate-300",
    label: "מחכה ללקוח",
  },
  "Proposal Needed": {
    cls: "border-accent-red/40 bg-accent-red/10 text-accent-red",
    label: "צריך הצעה",
  },
  "Proposal Sent": {
    cls: "border-brand-purple/40 bg-brand-purple/10 text-brand-purple",
    label: "הצעה נשלחה",
  },
  "Follow-up Needed": {
    cls: "border-brand-orange/40 bg-brand-orange/10 text-brand-orange",
    label: "צריך פולואפ",
  },
  "Hot Lead": {
    cls: "border-accent-red/50 bg-accent-red/15 text-accent-red",
    label: "ליד חם",
  },
  Scheduled: {
    cls: "border-brand-purple/40 bg-brand-purple/10 text-brand-purple",
    label: "נקבע",
  },
  Won: { cls: "border-accent-green/40 bg-accent-green/10 text-accent-green", label: "נסגר בהצלחה" },
  Lost: { cls: "border-slate-600 bg-slate-700/30 text-slate-400", label: "אבוד" },
  Closed: { cls: "border-slate-600 bg-slate-700/30 text-slate-400", label: "סגור" },
  Snoozed: {
    cls: "border-slate-600 bg-slate-700/30 text-slate-400",
    label: "נדחה",
  },
};

export function StatusBadge({ status }: { status: OpportunityStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Open;
  return <span className={`chip ${s.cls}`}>{s.label}</span>;
}

const TYPE_LABELS: Record<OpportunityType, string> = {
  "Speaking Request": "פנייה להרצאה",
  "Workshop Request": "בקשה לסדנה",
  "Consulting Request": "בקשת ייעוץ",
  "Quote Request": "בקשת הצעת מחיר",
  Collaboration: "שיתוף פעולה",
  "Media Request": "מדיה / ראיון",
  "Follow-up Needed": "צריך פולואפ",
  "Past Client Reactivation": "החייאת לקוח עבר",
  "Warm Lead": "ליד חם",
  "Content Opportunity": "הזדמנות לתוכן",
  "Not Relevant": "לא רלוונטי",
};

export function typeLabel(type: OpportunityType): string {
  return TYPE_LABELS[type] ?? type;
}

export function TypeBadge({ type }: { type: OpportunityType }) {
  return (
    <span className="chip border-brand-purple/30 bg-brand-soft text-slate-200">
      {typeLabel(type)}
    </span>
  );
}
