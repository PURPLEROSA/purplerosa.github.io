import type { PriceRecord, PriceStatus } from "@/lib/types";
import { serviceLabel, priceStatusLabel } from "@/lib/labels";
import { formatShortDate } from "@/lib/dateUtils";
import { formatMoney } from "@/lib/scoring";

const STATUS_CLS: Record<PriceStatus, string> = {
  Accepted: "border-accent-green/40 bg-accent-green/10 text-accent-green",
  Proposed: "border-accent-blue/40 bg-accent-blue/10 text-accent-blue",
  Negotiating: "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
  Rejected: "border-slate-600 bg-slate-700/30 text-slate-400",
  Unknown: "border-slate-600 bg-slate-700/30 text-slate-400",
};

export function PriceTable({
  prices,
  showClient = true,
}: {
  prices: PriceRecord[];
  showClient?: boolean;
}) {
  if (prices.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-slate-400">
        אין עדיין רשומות מחיר. כל מחיר שתרשמי כאן הופך לזיכרון שיגן עלייך בפעם הבאה.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-ink-border text-xs text-slate-400">
              {showClient && <th className="px-4 py-3 font-semibold">לקוח/ה</th>}
              <th className="px-4 py-3 font-semibold">שירות</th>
              <th className="px-4 py-3 font-semibold">הוצע</th>
              <th className="px-4 py-3 font-semibold">נגבה</th>
              <th className="px-4 py-3 font-semibold">תאריך</th>
              <th className="px-4 py-3 font-semibold">סטטוס</th>
              <th className="px-4 py-3 font-semibold">הערות</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p) => (
              <tr
                key={p.id}
                className="border-b border-ink-border/60 last:border-0 hover:bg-ink-raised/40"
              >
                {showClient && (
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-100">
                      {p.contactName}
                    </div>
                    {p.company && (
                      <div className="text-xs text-slate-500">{p.company}</div>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-slate-300">
                  {serviceLabel(p.serviceType)}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {p.priceProposed
                    ? formatMoney(p.priceProposed, p.currency)
                    : "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-100">
                  {p.priceCharged
                    ? formatMoney(p.priceCharged, p.currency)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatShortDate(p.dateAccepted || p.dateOffered)}
                </td>
                <td className="px-4 py-3">
                  <span className={`chip ${STATUS_CLS[p.status]}`}>
                    {priceStatusLabel(p.status)}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[220px] text-xs text-slate-400">
                  {p.notes || p.context || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
