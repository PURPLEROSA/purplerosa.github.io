import { Icon } from "./icons";

interface FactsBoxProps {
  facts: string[];
  assumptions: string[];
  suggestedAction?: string;
}

/**
 * The transparency panel. Every AI output is split into three honest
 * buckets so the user always knows what is real and what is a guess.
 */
export function FactsBox({ facts, assumptions, suggestedAction }: FactsBoxProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <div className="rounded-xl border border-accent-green/25 bg-accent-green/5 p-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Icon name="check" className="h-3.5 w-3.5 text-accent-green" />
          <span className="section-title text-accent-green">עובדות</span>
        </div>
        <ul className="space-y-1 text-sm text-slate-300">
          {facts.length === 0 && <li className="text-slate-500">—</li>}
          {facts.map((f, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-accent-green">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/5 p-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Icon name="alert" className="h-3.5 w-3.5 text-accent-amber" />
          <span className="section-title text-accent-amber">
            הנחות של ה-AI
          </span>
        </div>
        <ul className="space-y-1 text-sm text-slate-300">
          {assumptions.length === 0 && (
            <li className="text-slate-500">אין הנחות — הכל מבוסס עובדות.</li>
          )}
          {assumptions.map((a, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-accent-amber">•</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      {suggestedAction && (
        <div className="rounded-xl border border-brand-purple/30 bg-brand-soft p-3 sm:col-span-2">
          <div className="mb-1 flex items-center gap-1.5">
            <Icon name="arrow" className="h-3.5 w-3.5 text-brand-pink" />
            <span className="section-title text-brand-pink">פעולה מוצעת</span>
          </div>
          <p className="text-sm text-slate-200">{suggestedAction}</p>
        </div>
      )}
    </div>
  );
}
