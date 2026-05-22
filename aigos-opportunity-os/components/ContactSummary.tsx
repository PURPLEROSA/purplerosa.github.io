import Link from "next/link";
import type { Contact } from "@/lib/types";
import { stageLabel } from "@/lib/labels";
import { formatRelative } from "@/lib/dateUtils";
import { formatMoney } from "@/lib/scoring";
import { Icon } from "./icons";

const STAGE_CLS: Record<string, string> = {
  "Active Client": "border-accent-green/40 bg-accent-green/10 text-accent-green",
  "Past Client": "border-brand-orange/40 bg-brand-orange/10 text-brand-orange",
  "Warm Lead": "border-accent-red/40 bg-accent-red/10 text-accent-red",
  Partner: "border-brand-purple/40 bg-brand-purple/10 text-brand-purple",
  Media: "border-accent-blue/40 bg-accent-blue/10 text-accent-blue",
  Community: "border-brand-pink/40 bg-brand-pink/10 text-brand-pink",
  "New Contact": "border-slate-600 bg-slate-700/30 text-slate-300",
  Unknown: "border-slate-600 bg-slate-700/30 text-slate-400",
};

export function ContactSummary({ contact }: { contact: Contact }) {
  const c = contact;
  return (
    <Link
      href={`/contacts/${c.id}`}
      className="card card-hover block p-4 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-base font-bold text-white">
            {c.name.charAt(0)}
          </span>
          <div>
            <p className="font-bold text-slate-100">{c.name}</p>
            <p className="text-xs text-slate-400">
              {c.role ? `${c.role}` : "—"}
              {c.company ? ` · ${c.company}` : ""}
            </p>
          </div>
        </div>
        <span
          className={`chip ${STAGE_CLS[c.relationshipStage] ?? STAGE_CLS.Unknown}`}
        >
          {stageLabel(c.relationshipStage)}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-300">
        {c.relationshipSummary}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Icon name="clock" className="h-3.5 w-3.5" />
          קשר אחרון {formatRelative(c.lastInteractionDate)}
        </span>
        {c.nextFollowUpDate && (
          <span className="flex items-center gap-1">
            <Icon name="calendar" className="h-3.5 w-3.5" />
            פולואפ {formatRelative(c.nextFollowUpDate)}
          </span>
        )}
        {c.totalEstimatedValue > 0 && (
          <span className="flex items-center gap-1 text-accent-green">
            <Icon name="money" className="h-3.5 w-3.5" />
            {formatMoney(c.totalEstimatedValue)}
          </span>
        )}
      </div>
    </Link>
  );
}
