"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/ui";
import { ManagerNote } from "@/components/ManagerNote";
import { OpportunityCard } from "@/components/OpportunityCard";
import { GmailScanDialog } from "@/components/GmailScanDialog";
import { Icon } from "@/components/icons";
import { isHot, leadScore, OPEN_STATUSES, WAITING_FOR_ME } from "@/lib/scoring";

type Filter = "all" | "hot" | "waiting" | "quotes" | "closed";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "hot", label: "חמות" },
  { key: "waiting", label: "מחכות לי" },
  { key: "quotes", label: "בקשות מחיר" },
  { key: "closed", label: "סגורות" },
];

export default function OpportunitiesPage() {
  const { opportunities, settings } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [scanOpen, setScanOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...opportunities];
    if (filter === "hot")
      list = list.filter((o) => isHot(o, settings.hotLeadThreshold));
    else if (filter === "waiting")
      list = list.filter((o) => WAITING_FOR_ME.includes(o.status));
    else if (filter === "quotes")
      list = list.filter((o) => o.type === "Quote Request");
    else if (filter === "closed")
      list = list.filter((o) =>
        ["Won", "Lost", "Closed"].includes(o.status),
      );
    else list = list.filter((o) => OPEN_STATUSES.includes(o.status));

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.contactName.toLowerCase().includes(q) ||
          (o.company ?? "").toLowerCase().includes(q) ||
          o.summary.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => leadScore(b) - leadScore(a));
  }, [opportunities, filter, query, settings.hotLeadThreshold]);

  const counts = useMemo(() => {
    const open = opportunities.filter((o) => OPEN_STATUSES.includes(o.status));
    return {
      hot: open.filter((o) => isHot(o, settings.hotLeadThreshold)).length,
      waiting: opportunities.filter((o) => WAITING_FOR_ME.includes(o.status))
        .length,
    };
  }, [opportunities, settings.hotLeadThreshold]);

  return (
    <div>
      <PageHeader
        title="תיבת ההזדמנויות"
        subtitle="כל הזדמנות עסקית ככרטיס מובנה — עם הצעד הבא כבר מוכן."
      >
        <button onClick={() => setScanOpen(true)} className="btn-primary">
          <Icon name="inbox" className="h-4 w-4" />
          סריקת Gmail
        </button>
      </PageHeader>

      <div className="mb-5">
        <ManagerNote compact>
          {counts.hot > 0
            ? `${counts.hot} הזדמנויות חמות ו-${counts.waiting} שמחכות לך. סדרי לפי חום, לא לפי מצב רוח.`
            : "אין כרגע ליד בוער — זה הזמן המושלם לפנות יזום ללקוחות עבר."}
        </ManagerNote>
      </div>

      {/* Filters + search */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`chip transition-colors ${
              filter === f.key
                ? "border-brand-purple/50 bg-brand-soft text-white"
                : "border-ink-border bg-ink-raised text-slate-400 hover:text-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="relative ms-auto w-full sm:w-64">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי שם, חברה או תוכן…"
            className="input"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="אין הזדמנויות בקטגוריה הזו"
          text="נסי מסנן אחר, או הריצי סריקת Gmail."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      )}

      <GmailScanDialog open={scanOpen} onClose={() => setScanOpen(false)} />
    </div>
  );
}
