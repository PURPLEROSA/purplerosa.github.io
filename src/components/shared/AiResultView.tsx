"use client";

import type { AiResponse } from "@/lib/ai/types";
import { Icon } from "@/components/ui";
import { CopyButton } from "./CopyButton";

/** מציג טקסט עם הדגשות **bold** בסיסיות. */
function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
      {text.split("\n").map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className={line.trim() === "" ? "h-1" : ""}>
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**") ? (
                <strong key={j} className="font-bold text-ink">
                  {p.slice(2, -2)}
                </strong>
              ) : (
                <span key={j}>{p}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

/** הצגת תוצאת AI — תומך בטקסט וגם בפלט מובנה (sections). */
export function AiResultView({ result }: { result: AiResponse }) {
  const copyText =
    result.text ??
    result.sections?.map((s) => `${s.heading}\n${s.content}`).join("\n\n") ??
    "";

  return (
    <div className="animate-fade-up rounded-2xl border border-purple/25 bg-surface-2/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <Icon name="Sparkles" className="size-4" />
          </span>
          <span className="text-sm font-bold text-ink">התוצאה מוכנה</span>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-ink-mute">
            {result.provider === "mock" ? "מנוע Mock" : "AI חי"}
          </span>
        </div>
        {copyText && <CopyButton text={copyText} />}
      </div>

      {result.text && <RichText text={result.text} />}

      {result.sections && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {result.sections.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-surface p-3"
            >
              <div className="mb-1 text-xs font-bold text-purple-soft">
                {s.heading}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                {s.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {result.note && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-mute">
          <Icon name="Info" className="size-3" />
          {result.note}
        </p>
      )}
    </div>
  );
}
