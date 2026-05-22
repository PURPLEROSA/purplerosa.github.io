"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Icon,
  EmptyState,
} from "@/components/ui";
import { CopyButton } from "@/components/shared/CopyButton";

/* ---------- טיפוסים ---------- */

interface Source {
  label: string;
  title: string;
  screen: string;
}

interface AskResponse {
  answer: string;
  sources: Source[];
  provider: string;
}

interface ChatTurn {
  id: string;
  question: string;
  /** התשובה — null כל עוד היא נטענת. */
  answer: string | null;
  sources: Source[];
  error: string | null;
}

/* ---------- שאלות פתיחה מוצעות ---------- */

const STARTER_QUESTIONS = [
  "מה הכי דחוף היום?",
  "מה מוכן לפרסום?",
  "מה חם בטרנדים?",
  "מה תקוע?",
  "על מה להתמקד השבוע?",
  "אילו הזדמנויות יש לי במייל?",
];

/* ---------- עיבוד טקסט התשובה ---------- */

/** מפצל שורה ל-spans, ותומך ב-**מודגש**. */
function renderInline(line: string, keyBase: string) {
  const segments = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return segments.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return (
        <strong key={`${keyBase}-${i}`} className="font-bold text-ink">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyBase}-${i}`}>{seg}</span>;
  });
}

/** מציג את תשובת SHELLY OG: פסקאות, בולטים ומודגשים. */
function AnswerBody({ text }: { text: string }) {
  const blocks = text.split("\n\n").filter((b) => b.trim());

  return (
    <div className="space-y-3">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim());
        const bulletLines = lines.filter((l) => l.trimStart().startsWith("• "));
        const isBulletBlock =
          bulletLines.length > 0 && bulletLines.length === lines.length;

        if (isBulletBlock) {
          return (
            <ul key={bi} className="space-y-1.5">
              {lines.map((line, li) => {
                const content = line.trimStart().slice(2);
                return (
                  <li
                    key={li}
                    className="flex gap-2 text-sm leading-relaxed text-ink-soft"
                  >
                    <Icon
                      name="Sparkle"
                      className="mt-1 size-3 shrink-0 text-purple-soft"
                    />
                    <span>{renderInline(content, `b${bi}-l${li}`)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={bi} className="text-sm leading-relaxed text-ink-soft">
            {lines.map((line, li) => (
              <span key={li}>
                {li > 0 && <br />}
                {line.trimStart().startsWith("• ") ? (
                  <span className="flex gap-2">
                    <Icon
                      name="Sparkle"
                      className="mt-1 size-3 shrink-0 text-purple-soft"
                    />
                    <span>
                      {renderInline(line.trimStart().slice(2), `b${bi}-l${li}`)}
                    </span>
                  </span>
                ) : (
                  renderInline(line, `b${bi}-l${li}`)
                )}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/* ---------- בועת שאלה של שלי ---------- */

function QuestionBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-ink-soft">
          <Icon name="User" className="size-4" />
        </div>
        <div className="rounded-2xl rounded-tr-md bg-brand-gradient px-4 py-2.5 text-sm font-medium leading-relaxed text-white shadow-glow">
          {text}
        </div>
      </div>
    </div>
  );
}

/* ---------- כרטיס תשובה של SHELLY OG ---------- */

function AnswerCard({ turn }: { turn: ChatTurn }) {
  return (
    <div className="flex justify-start">
      <div className="flex w-full max-w-[92%] items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
          <Icon name="Sparkles" className="size-4" />
        </div>
        <Card className="flex-1">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <span className="so-gradient-text font-display text-sm font-bold">
              SHELLY OG
            </span>
            {turn.answer && (
              <CopyButton text={turn.answer} label="העתקי תשובה" />
            )}
          </div>

          {turn.error ? (
            <p className="rounded-xl border border-pink/30 bg-pink/10 p-3 text-sm text-pink">
              {turn.error}
            </p>
          ) : turn.answer === null ? (
            <div className="flex items-center gap-2 text-sm text-ink-mute">
              <Icon name="Loader2" className="size-4 animate-spin text-purple-soft" />
              חושבת...
            </div>
          ) : (
            <>
              <AnswerBody text={turn.answer} />

              {turn.sources.length > 0 && (
                <div className="mt-4 border-t border-line pt-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink-mute">
                    <Icon name="Link2" className="size-3.5" />
                    מקורות במערכת
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {turn.sources.map((s, i) => (
                      <Link
                        key={`${s.screen}-${s.title}-${i}`}
                        href={s.screen}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface-2 px-2.5 py-1 text-xs text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
                      >
                        <Badge tone="purple" className="!px-1.5 !py-0">
                          {s.label}
                        </Badge>
                        <span className="font-medium">{s.title}</span>
                        <Icon name="ArrowLeft" className="size-3 text-ink-mute" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------- המסך הפנימי (משתמש ב-useSearchParams) ---------- */

function AskScreen() {
  const searchParams = useSearchParams();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const threadEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** מבטיח שהשאלה מה-URL נשלחת פעם אחת בלבד. */
  const autoAsked = useRef(false);

  /** שולח שאלה ל-API ומעדכן את חוט השיחה. */
  const ask = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || loading) return;

      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setInput("");
      setLoading(true);
      setTurns((prev) => [
        ...prev,
        { id, question, answer: null, sources: [], error: null },
      ]);

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(
            data?.error || "לא הצלחתי לענות כרגע. נסי שוב עוד רגע."
          );
        }

        const data = (await res.json()) as AskResponse;
        setTurns((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, answer: data.answer, sources: data.sources ?? [] }
              : t
          )
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "משהו השתבש. נסי שוב עוד רגע.";
        setTurns((prev) =>
          prev.map((t) => (t.id === id ? { ...t, error: message } : t))
        );
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  /* שאלה אוטומטית מפרמטר ?q= */
  useEffect(() => {
    if (autoAsked.current) return;
    const q = searchParams.get("q");
    if (q && q.trim()) {
      autoAsked.current = true;
      ask(q);
    }
  }, [searchParams, ask]);

  /* גלילה אוטומטית לתחתית החוט */
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(input);
    inputRef.current?.focus();
  }

  const isEmpty = turns.length === 0;

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col">
      <PageHeader
        icon="MessagesSquare"
        title="שאלי אותי"
        subtitle="כל שאלה — ואני עונה לך מתוך כל מה שיש במערכת."
      />

      {/* ===== חוט השיחה ===== */}
      <div className="flex-1 space-y-4 pb-4">
        {isEmpty ? (
          <div className="animate-fade-up space-y-5">
            <EmptyState
              icon="Sparkles"
              title="אני ה-Chief of Staff שלך — שאלי אותי הכל"
              description="רעיונות, טרנדים, פרויקטים, הזדמנויות, ספרייה, חדשות והדוח השבועי — הכל זמין לי. כתבי שאלה למטה, או התחילי מאחת מאלה:"
            />
            <Card className="animate-fade-up">
              <div className="mb-3 flex items-center gap-2">
                <Icon name="Wand2" className="size-4 text-purple-soft" />
                <h2 className="font-display text-sm font-bold text-ink">
                  שאלות לפתיחה מהירה
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => ask(q)}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 px-3 py-2 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon name="ArrowLeft" className="size-3.5 text-purple-soft" />
                    {q}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {turns.map((turn) => (
              <div key={turn.id} className="animate-fade-up space-y-3">
                <QuestionBubble text={turn.question} />
                <AnswerCard turn={turn} />
              </div>
            ))}
          </div>
        )}
        <div ref={threadEndRef} />
      </div>

      {/* ===== תיבת קלט ===== */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 -mx-1 mt-auto bg-surface/80 px-1 pb-3 pt-2 backdrop-blur-md"
      >
        <div className="so-card flex items-center gap-2 p-2">
          <Icon name="MessageCircle" className="ms-1.5 size-4 shrink-0 text-ink-mute" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="שאלי אותי כל דבר על מה שקורה במערכת..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-mute focus:outline-none disabled:opacity-50"
            dir="rtl"
            autoComplete="off"
          />
          <Button
            type="submit"
            icon={loading ? undefined : "Send"}
            loading={loading}
            disabled={!input.trim()}
          >
            {loading ? "חושבת..." : "שלחי"}
          </Button>
        </div>
        <p className="mt-1.5 px-1 text-center text-[11px] text-ink-mute">
          SHELLY OG עונה מתוך כל המידע באפליקציה — רעיונות, טרנדים, פרויקטים והזדמנויות.
        </p>
      </form>
    </div>
  );
}

/* ---------- fallback ל-Suspense ---------- */

function AskFallback() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon="MessagesSquare"
        title="שאלי אותי"
        subtitle="כל שאלה — ואני עונה לך מתוך כל מה שיש במערכת."
      />
      <Card className="flex items-center gap-2 text-sm text-ink-mute">
        <Icon name="Loader2" className="size-4 animate-spin text-purple-soft" />
        טוענת...
      </Card>
    </div>
  );
}

/* ---------- העמוד המיוצא ---------- */

export default function AskPage() {
  return (
    <Suspense fallback={<AskFallback />}>
      <AskScreen />
    </Suspense>
  );
}
