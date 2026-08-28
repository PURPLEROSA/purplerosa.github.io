"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader, SectionHeading } from "@/components/ui";
import { ManagerNote } from "@/components/ManagerNote";
import { PriceTable } from "@/components/PriceTable";
import { Icon } from "@/components/icons";
import { serviceLabel } from "@/lib/labels";
import { formatMoney } from "@/lib/scoring";

export default function PricesPage() {
  const { prices } = useStore();
  const [service, setService] = useState<string>("all");

  const serviceTypes = useMemo(
    () => Array.from(new Set(prices.map((p) => p.serviceType))),
    [prices],
  );

  const filtered = useMemo(() => {
    const list =
      service === "all"
        ? prices
        : prices.filter((p) => p.serviceType === service);
    return [...list].sort((a, b) =>
      (b.dateOffered ?? "").localeCompare(a.dateOffered ?? ""),
    );
  }, [prices, service]);

  const stats = useMemo(() => {
    const accepted = prices.filter((p) => p.status === "Accepted");
    const earned = accepted.reduce((s, p) => s + (p.priceCharged ?? 0), 0);
    const openValue = prices
      .filter((p) => p.status === "Proposed" || p.status === "Negotiating")
      .reduce((s, p) => s + (p.priceProposed ?? 0), 0);
    const avg = accepted.length ? Math.round(earned / accepted.length) : 0;
    return { earned, openValue, avg, acceptedCount: accepted.length };
  }, [prices]);

  // Service-level price ranges -> tough warnings.
  const warnings = useMemo(() => {
    const out: string[] = [];
    const byService = new Map<string, number[]>();
    for (const p of prices) {
      const v = p.priceCharged ?? p.priceProposed;
      if (!v) continue;
      const arr = byService.get(p.serviceType) ?? [];
      arr.push(v);
      byService.set(p.serviceType, arr);
    }
    for (const [svc, values] of Array.from(byService.entries())) {
      if (values.length < 2) continue;
      const min = Math.min(...values);
      const max = Math.max(...values);
      if (min === max) continue;
      out.push(
        `${serviceLabel(svc)}: תומחר בעבר בטווח ${formatMoney(
          min,
        )}–${formatMoney(max)}. אל תצאי מהטווח בלי סיבה אמיתית.`,
      );
    }
    out.push(
      "לקוח ארגוני זה לא טובה מהירה. אם יש לוגו של חברה גדולה — תמחרי לפי הערך, לא לפי הנוחות שלו.",
    );
    return out;
  }, [prices]);

  return (
    <div>
      <PageHeader
        title="זיכרון מחירים"
        subtitle="מה הצעת, מה לקחת, ומתי — כדי שלא תמציאי מחיר מתוך עייפות."
      />

      <div className="mb-6">
        <ManagerNote>
          זיכרון מחירים זה מה שמפריד בין &ldquo;תמחרתי לפי תחושה&rdquo; לבין
          &ldquo;תמחרתי לפי נתונים&rdquo;. בכל פעם שתרשמי מחיר — את מחזקת את
          העמדה שלך למשא ומתן הבא.
        </ManagerNote>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          icon="money"
          label="הכנסה שאושרה"
          value={formatMoney(stats.earned)}
          accent="text-accent-green"
        />
        <Stat
          icon="clock"
          label="ממתין לסגירה"
          value={formatMoney(stats.openValue)}
          accent="text-accent-amber"
        />
        <Stat
          icon="sparkles"
          label="מחיר ממוצע לעסקה"
          value={stats.acceptedCount ? formatMoney(stats.avg) : "—"}
          accent="text-brand-purple"
        />
      </div>

      {/* AI warnings */}
      <section className="mb-6">
        <SectionHeading title="אזהרות תמחור מהמנהלת" />
        <div className="grid gap-2 sm:grid-cols-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-3 text-sm text-slate-200"
            >
              <Icon
                name="alert"
                className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber"
              />
              {w}
            </div>
          ))}
        </div>
      </section>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setService("all")}
          className={`chip transition-colors ${
            service === "all"
              ? "border-brand-purple/50 bg-brand-soft text-white"
              : "border-ink-border bg-ink-raised text-slate-400 hover:text-slate-200"
          }`}
        >
          כל השירותים
        </button>
        {serviceTypes.map((s) => (
          <button
            key={s}
            onClick={() => setService(s)}
            className={`chip transition-colors ${
              service === s
                ? "border-brand-purple/50 bg-brand-soft text-white"
                : "border-ink-border bg-ink-raised text-slate-400 hover:text-slate-200"
            }`}
          >
            {serviceLabel(s)}
          </button>
        ))}
      </div>

      <PriceTable prices={filtered} />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-raised text-slate-400">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <div className={`text-xl font-extrabold ${accent}`}>{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}
