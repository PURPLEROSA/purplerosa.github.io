"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { CopyButton } from "./CopyButton";
import type { AiResponse } from "@/lib/ai/types";
import { uid } from "@/lib/utils";

/* כפתורי החידוד המהירים — שיחה על הטקסט אחרי שנכתב. */
const QUICK_REFINES: { label: string; icon: string; instr: string }[] = [
  { label: "מקצועי יותר", icon: "Briefcase", instr: "תעשי גרסה מקצועית וממוקדת יותר" },
  { label: "אישי יותר", icon: "Heart", instr: "תעשי גרסה אישית וחמה יותר" },
  { label: "חד יותר", icon: "Scissors", instr: "תעשי גרסה חדה וישירה יותר" },
  { label: "קצר יותר", icon: "Minimize2", instr: "תקצרי — רק העיקר" },
  { label: "מצחיק יותר", icon: "Laugh", instr: "תוסיפי קריצה והומור קליל" },
];

interface Msg {
  id: string;
  role: "app" | "you";
  text: string;
  sections?: { heading: string; content: string }[];
  note?: string;
}

function textOf(r: AiResponse): string {
  if (r.text) return r.text;
  if (r.sections)
    return r.sections.map((s) => `${s.heading}\n${s.content}`).join("\n\n");
  return "";
}

/** מציג טקסט עם הדגשות **bold**. */
function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
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

interface RefineChatProps {
  /** משימת ה-AI לכתיבה הראשונה. */
  seedTask: string;
  /** הקלט לכתיבה הראשונה. */
  seedInput: string;
  /** הקשר טון (toneToContext). */
  tone?: string;
  /** הקשר נוסף לכתיבה הראשונה. */
  seedContext?: string;
  /** טקסט כפתור הכתיבה. */
  generateLabel?: string;
}

/** כתיבה + שיחת חידוד + העתקה — לב היצירה של SHELLY OG. */
export function RefineChat({
  seedTask,
  seedInput,
  tone,
  seedContext,
  generateLabel = "כתבי לי את הפוסט",
}: RefineChatProps) {
  const [thread, setThread] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  async function callAi(
    task: string,
    input: string,
    context?: string
  ): Promise<AiResponse | null> {
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task, input, context }),
      });
      if (!res.ok) throw new Error("ai failed");
      return (await res.json()) as AiResponse;
    } catch {
      setError("היצירה נכשלה. נסי שוב.");
      return null;
    }
  }

  async function generate() {
    setLoading(true);
    setError(null);
    const ctx = [seedContext, tone].filter(Boolean).join("\n");
    const r = await callAi(seedTask, seedInput, ctx || undefined);
    if (r)
      setThread([
        { id: uid("m"), role: "app", text: textOf(r), sections: r.sections, note: r.note },
      ]);
    setLoading(false);
  }

  async function refine(instruction: string) {
    const lastApp = [...thread].reverse().find((m) => m.role === "app");
    if (!lastApp || !instruction.trim()) return;
    setLoading(true);
    setError(null);
    setThread((t) => [
      ...t,
      { id: uid("m"), role: "you", text: instruction.trim() },
    ]);
    const r = await callAi("refine", instruction.trim(), lastApp.text);
    if (r)
      setThread((t) => [
        ...t,
        { id: uid("m"), role: "app", text: textOf(r), sections: r.sections, note: r.note },
      ]);
    setLoading(false);
  }

  function submitDraft() {
    if (!draft.trim()) return;
    refine(draft);
    setDraft("");
  }

  /* --- מצב התחלתי: כפתור כתיבה --- */
  if (thread.length === 0) {
    return (
      <div className="rounded-2xl border border-purple/25 bg-surface-2/70 p-4">
        <button
          onClick={generate}
          disabled={loading}
          className="so-btn-primary w-full"
        >
          <Icon
            name={loading ? "Loader2" : "PenLine"}
            className={loading ? "size-4 animate-spin" : "size-4"}
          />
          {loading ? "כותבת..." : generateLabel}
        </button>
        {error && (
          <p className="mt-2 text-center text-xs text-pink">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-purple/25 bg-surface-2/70 p-4">
      {/* שרשור השיחה */}
      <div className="space-y-3">
        {thread.map((m) =>
          m.role === "app" ? (
            <div
              key={m.id}
              className="animate-fade-up rounded-xl border border-line bg-surface p-3.5"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-brand-gradient text-white">
                    <Icon name="Sparkles" className="size-3.5" />
                  </span>
                  <span className="text-xs font-bold text-ink">SHELLY OG</span>
                </div>
                <CopyButton text={m.text} />
              </div>
              {m.sections ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {m.sections.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-line bg-surface-2 p-2.5"
                    >
                      <div className="mb-0.5 text-[11px] font-bold text-purple-soft">
                        {s.heading}
                      </div>
                      <div className="whitespace-pre-wrap text-xs leading-relaxed text-ink-soft">
                        {s.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <RichText text={m.text} />
              )}
              {m.note && (
                <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-mute">
                  <Icon name="Info" className="size-3" />
                  {m.note}
                </p>
              )}
            </div>
          ) : (
            <div key={m.id} className="flex justify-start">
              <div className="inline-flex max-w-[85%] items-center gap-1.5 rounded-xl border border-line-strong bg-surface-3 px-3 py-1.5 text-xs text-ink-soft">
                <Icon name="CornerDownLeft" className="size-3 text-ink-mute" />
                ביקשת: {m.text}
              </div>
            </div>
          )
        )}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-ink-mute">
            <Icon name="Loader2" className="size-3.5 animate-spin" />
            מעדכנת...
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-pink">{error}</p>}

      {/* שורת חידוד */}
      <div className="mt-3.5 border-t border-line pt-3">
        <div className="mb-2 text-[11px] font-bold text-ink-mute">
          רוצה לשנות? בקשי שינוי ונדבר על זה:
        </div>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK_REFINES.map((r) => (
            <button
              key={r.label}
              onClick={() => refine(r.instr)}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-lg border border-line-strong bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink disabled:opacity-50"
            >
              <Icon name={r.icon} className="size-3" />
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitDraft()}
            placeholder="או כתבי בקשה משלך — למשל 'תוסיפי דוגמה אישית'..."
            className="flex-1 rounded-xl border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-mute hover:border-purple/50 focus:border-purple"
          />
          <button
            onClick={submitDraft}
            disabled={loading || !draft.trim()}
            className="so-btn-primary !px-3 !py-2"
            aria-label="שלחי בקשה"
          >
            <Icon name="ArrowLeft" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
