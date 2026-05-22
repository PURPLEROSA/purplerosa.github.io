"use client";

import Link from "next/link";
import type { AIInsight, InsightType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { insightTypeLabel } from "@/lib/labels";
import { Icon } from "./icons";

const TYPE_STYLE: Record<InsightType, { cls: string; icon: string }> = {
  "Hot Lead": { cls: "text-accent-red", icon: "fire" },
  "Price Reminder": { cls: "text-accent-green", icon: "money" },
  "Follow-up Risk": { cls: "text-accent-amber", icon: "alert" },
  Reactivation: { cls: "text-brand-orange", icon: "arrow" },
  "Content Idea": { cls: "text-brand-purple", icon: "sparkles" },
  "Collaboration Idea": { cls: "text-brand-pink", icon: "contacts" },
  "Missed Opportunity": { cls: "text-accent-amber", icon: "alert" },
};

export function InsightCard({ insight }: { insight: AIInsight }) {
  const { dismissInsight } = useStore();
  const style = TYPE_STYLE[insight.type];

  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`${style.cls}`}>
            <Icon name={style.icon} className="h-4 w-4" />
          </span>
          <span className="section-title text-slate-400">
            {insightTypeLabel(insight.type)}
          </span>
        </div>
        <button
          onClick={() => dismissInsight(insight.id)}
          className="text-slate-500 hover:text-slate-300"
          aria-label="התעלמות"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-2 font-bold text-slate-100">{insight.title}</h3>
      <p className="mt-1 text-sm text-slate-300">{insight.insight}</p>

      <div className="mt-2 rounded-lg border border-ink-border bg-ink-soft/60 p-2.5">
        <span className="section-title text-slate-500">למה אני חושבת ככה</span>
        <p className="mt-0.5 text-xs text-slate-400">{insight.reasoning}</p>
      </div>

      <div className="mt-2 rounded-lg border border-brand-purple/25 bg-brand-soft p-2.5">
        <span className="section-title text-brand-pink">פעולה מוצעת</span>
        <p className="mt-0.5 text-sm text-slate-200">
          {insight.suggestedAction}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          ביטחון {insight.confidenceScore}%
        </span>
        {insight.relatedContactId && (
          <Link
            href={`/contacts/${insight.relatedContactId}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white"
          >
            לכרטיס איש הקשר
            <Icon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
