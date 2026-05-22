"use client";

import { useMemo, useState } from "react";
import {
  PageHeader,
  Card,
  Badge,
  Icon,
  Button,
  Pill,
  EmptyState,
} from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { AiResultView } from "@/components/shared/AiResultView";
import { CopyButton } from "@/components/shared/CopyButton";
import { useAi } from "@/components/shared/use-ai";
import { mockIdeas } from "@/lib/mock-data";
import { STUDIO_ACTIONS, PLATFORM_LABELS, CONTENT_TYPE_LABELS } from "@/lib/constants";
import type { ViralAngle } from "@/lib/ai/types";

/* ---------- הגדרת הטאבים ---------- */

type TabId = "converter" | "camera" | "angles";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "converter", label: "סטודיו", icon: "Wand2" },
  { id: "camera", label: "מה להגיד מול מצלמה", icon: "Video" },
  { id: "angles", label: "מנוע זוויות חזקות", icon: "Flame" },
];

/* ============================================================= */

export default function StudioPage() {
  const [tab, setTab] = useState<TabId>("converter");

  return (
    <div className="space-y-6">
      <PageHeader
        icon="Sparkles"
        title="סטודיו תוכן"
        subtitle="מרעיון לפוסט. כאן הופכים מחשבה לתוכן שמוכן לצאת החוצה."
      />

      {/* ===== בורר טאבים ===== */}
      <div className="animate-fade-up">
        <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-surface-2/60 p-1.5">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  active
                    ? "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow transition-all"
                    : "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-mute transition-all hover:bg-white/5 hover:text-ink"
                }
              >
                <Icon name={t.icon} className="size-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "converter" && <ConverterTab />}
      {tab === "camera" && <CameraTab />}
      {tab === "angles" && <AnglesTab />}
    </div>
  );
}

/* ============================================================= */
/* טאב א' — הממיר (Converter)                                     */
/* ============================================================= */

function ConverterTab() {
  const ai = useAi();
  const [selectedId, setSelectedId] = useState<string>("");
  const [freeText, setFreeText] = useState("");

  const selectedIdea = useMemo(
    () => mockIdeas.find((i) => i.id === selectedId) ?? null,
    [selectedId]
  );

  /** הטקסט שיישלח ל-AI — טקסט חופשי גובר על רעיון נבחר. */
  const sourceText = useMemo(() => {
    if (freeText.trim()) return freeText.trim();
    if (selectedIdea)
      return `${selectedIdea.title}\n${selectedIdea.description}`;
    return "";
  }, [freeText, selectedIdea]);

  const hasSource = sourceText.length > 0;

  const context = selectedIdea
    ? `פלטפורמה: ${PLATFORM_LABELS[selectedIdea.platform]} · פורמט: ${CONTENT_TYPE_LABELS[selectedIdea.contentType]}`
    : undefined;

  function handleAction(task: string) {
    if (!hasSource) return;
    ai.run(task, sourceText, context);
  }

  return (
    <div className="space-y-6">
      {/* בחירת מקור */}
      <Card className="animate-fade-up">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="FileInput" className="size-4 text-purple-soft" />
          <h2 className="font-display text-sm font-bold text-ink">
            מאיזה חומר נעבוד?
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* בחירה מהרעיונות */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-mute">
              בחרי רעיון מתיבת הרעיונות
            </label>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 pl-9 text-sm text-ink outline-none transition-colors hover:border-purple/50 focus:border-purple"
              >
                <option value="">— בלי רעיון, אעבוד עם טקסט חופשי —</option>
                {mockIdeas.map((idea) => (
                  <option key={idea.id} value={idea.id}>
                    {idea.title}
                  </option>
                ))}
              </select>
              <Icon
                name="ChevronDown"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute"
              />
            </div>
          </div>

          {/* טקסט חופשי */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-mute">
              או הדביקי טקסט / רעיון משלך
            </label>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={3}
              placeholder="כתבי כאן רעיון, תובנה, נושא או טקסט גולמי..."
              className="w-full resize-none rounded-xl border border-line-strong bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-mute hover:border-purple/50 focus:border-purple"
            />
          </div>
        </div>

        {/* תצוגת המקור הנבחר */}
        {selectedIdea && (
          <div className="mt-4 rounded-xl border border-purple/25 bg-purple/5 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="purple" icon="Lightbulb">
                רעיון נבחר
              </Badge>
              <Badge tone="electric">
                {PLATFORM_LABELS[selectedIdea.platform]}
              </Badge>
              <Badge tone="mute">
                {CONTENT_TYPE_LABELS[selectedIdea.contentType]}
              </Badge>
              {freeText.trim() && (
                <span className="text-[11px] text-orange">
                  הטקסט החופשי גובר על הרעיון הנבחר
                </span>
              )}
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">
              {selectedIdea.title}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
              {selectedIdea.description}
            </p>
          </div>
        )}
      </Card>

      {/* כפתורי ההמרה */}
      <Card className="animate-fade-up">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="Wand2" className="size-4 text-pink" />
          <h2 className="font-display text-sm font-bold text-ink">
            מה נעשה עם זה?
          </h2>
        </div>
        <p className="mb-4 text-xs text-ink-mute">
          לחיצה אחת — ואני הופכת את החומר לפורמט שבחרת, בקול שלך.
        </p>

        {!hasSource && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-orange/25 bg-orange/5 px-3 py-2.5 text-sm text-orange">
            <Icon name="Hand" className="size-4 shrink-0" />
            קודם בחרי רעיון או הדביקי טקסט — ואז כל הכלים נפתחים.
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {STUDIO_ACTIONS.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              icon={action.icon}
              disabled={!hasSource}
              loading={ai.loading && ai.activeTask === action.task}
              onClick={() => handleAction(action.task)}
              className="!justify-start text-right"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* תוצאה */}
      {ai.error && (
        <p className="animate-fade-up rounded-2xl border border-pink/30 bg-pink/10 p-3 text-sm text-pink">
          {ai.error}
        </p>
      )}
      {ai.result && (
        <div className="animate-fade-up">
          <AiResultView result={ai.result} />
        </div>
      )}
      {!ai.result && !ai.error && !ai.loading && hasSource && (
        <div className="animate-fade-up">
          <EmptyState
            icon="Sparkles"
            title="הכל מוכן — בחרי כלי למעלה"
            description="המקור נטען. עכשיו לחצי על אחד הכלים ואני אכין לך תוצאה."
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================= */
/* טאב ב' — קואצ'ר המצלמה                                         */
/* ============================================================= */

function CameraTab() {
  const ai = useAi();
  const [topic, setTopic] = useState("");

  const canRun = topic.trim().length > 0;

  function handleRun() {
    if (!canRun) return;
    ai.run("camera-coach", topic.trim());
  }

  return (
    <div className="space-y-6">
      {/* אינטרו */}
      <Card glow className="relative animate-fade-up overflow-hidden">
        <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-pink/15 blur-3xl" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="pink" icon="Video">
              קואצ'ר מצלמה
            </Badge>
          </div>
          <h2 className="font-display text-xl font-bold text-ink">
            לעמוד מול מצלמה בלי לתקוע
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            תני לי נושא — ואני בונה לך תסריט צילום שלם: פתיח של 3 שניות שעוצר
            גלילה, גרסת דיבור טבעית, 3 נקודות מפתח, דוגמה אחת חזקה, משפט סגירה,
            CTA, גרסת 30 שניות וגרסת 60 שניות, טקסטים למסך, הצעות לקאטים, רעיון
            ויזואלי לפתיחה ומשפט פתיחה חד. הכל בקול שלך — חכמה, ישירה, אנושית
            ומקצועית, עם קריצה קטנה ובלי להישמע רובוטית.
          </p>
        </div>
      </Card>

      {/* קלט */}
      <Card className="animate-fade-up">
        <label className="mb-1.5 block text-sm font-bold text-ink">
          על מה תצלמי?
        </label>
        <p className="mb-3 text-xs text-ink-mute">
          נושא, תובנה או רעיון — ככל שתהיי ספציפית, התסריט יהיה חד יותר.
        </p>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={4}
          placeholder="לדוגמה: למה רוב המותגים משתמשים ב-AI בדיוק לא נכון..."
          className="w-full resize-none rounded-xl border border-line-strong bg-surface-2 px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-mute hover:border-purple/50 focus:border-purple"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-ink-mute">
            מקבלים תסריט מלא — מהפתיח ועד ה-CTA.
          </span>
          <Button
            icon="Clapperboard"
            disabled={!canRun}
            loading={ai.loading}
            onClick={handleRun}
          >
            מה להגיד מול מצלמה?
          </Button>
        </div>
      </Card>

      {/* תוצאה */}
      {ai.error && (
        <p className="animate-fade-up rounded-2xl border border-pink/30 bg-pink/10 p-3 text-sm text-pink">
          {ai.error}
        </p>
      )}
      {ai.result && (
        <div className="animate-fade-up">
          <AiResultView result={ai.result} />
        </div>
      )}
      {!ai.result && !ai.error && !ai.loading && (
        <div className="animate-fade-up">
          <EmptyState
            icon="Video"
            title="התסריט שלך יופיע כאן"
            description="כתבי נושא למעלה ולחצי על הכפתור — ואני אכין לך תסריט צילום מלא."
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================= */
/* טאב ג' — מנוע זוויות חזקות                                      */
/* ============================================================= */

const RISK_TONE: Record<ViralAngle["riskLevel"], BadgeTone> = {
  נמוך: "lime",
  בינוני: "orange",
  גבוה: "pink",
};

const POTENTIAL_TONE: Record<ViralAngle["potentialLevel"], BadgeTone> = {
  בינוני: "electric",
  גבוה: "purple",
  "מאוד גבוה": "pink",
};

function AnglesTab() {
  const ai = useAi();
  const [topic, setTopic] = useState("");

  const canRun = topic.trim().length > 0;
  const angles = ai.result?.angles ?? [];

  function handleRun() {
    if (!canRun) return;
    ai.run("viral-angles", topic.trim());
  }

  return (
    <div className="space-y-6">
      {/* אינטרו */}
      <Card glow className="relative animate-fade-up overflow-hidden">
        <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-orange/15 blur-3xl" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="orange" icon="Flame">
              מנוע זוויות
            </Badge>
          </div>
          <h2 className="font-display text-xl font-bold text-ink">
            נושא אחד, כמה דרכים לפוצץ אותו
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            תני לי נושא — ואני אחזיר כמה זוויות שונות לתקוף אותו: חינוכית,
            ביקורתית, אישית, מצחיקה, מבדלת. לכל זווית אני מסבירה למה היא עובדת,
            מציינת רמת סיכון ופוטנציאל, ונותנת לך דוגמת פתיח. בחרי את הזווית
            שהכי "את" — ורוצי איתה.
          </p>
        </div>
      </Card>

      {/* קלט */}
      <Card className="animate-fade-up">
        <label className="mb-1.5 block text-sm font-bold text-ink">
          מה הנושא?
        </label>
        <p className="mb-3 text-xs text-ink-mute">
          רעיון, טרנד או תובנה — ואני אפרק אותו לזוויות שמייצרות תגובה.
        </p>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={4}
          placeholder="לדוגמה: סוכני AI נכנסים לכל אפליקציית עבודה..."
          className="w-full resize-none rounded-xl border border-line-strong bg-surface-2 px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-mute hover:border-purple/50 focus:border-purple"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-ink-mute">
            מקבלים מבחר זוויות מדורגות לפי סיכון ופוטנציאל.
          </span>
          <Button
            icon="Flame"
            disabled={!canRun}
            loading={ai.loading}
            onClick={handleRun}
          >
            מצאי לי זוויות חזקות
          </Button>
        </div>
      </Card>

      {/* תוצאה */}
      {ai.error && (
        <p className="animate-fade-up rounded-2xl border border-pink/30 bg-pink/10 p-3 text-sm text-pink">
          {ai.error}
        </p>
      )}

      {angles.length > 0 && (
        <div className="animate-fade-up space-y-3">
          <h3 className="so-section-title flex items-center gap-2">
            <Icon name="Sparkles" className="size-5 text-orange" />
            {angles.length} זוויות לנושא שלך
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {angles.map((angle) => (
              <AngleCard key={angle.id} angle={angle} />
            ))}
          </div>
        </div>
      )}

      {!ai.result && !ai.error && !ai.loading && (
        <div className="animate-fade-up">
          <EmptyState
            icon="Flame"
            title="הזוויות שלך יופיעו כאן"
            description="כתבי נושא למעלה — ואני אפרק אותו לכמה דרכים חזקות לעבוד איתו."
          />
        </div>
      )}
    </div>
  );
}

function AngleCard({ angle }: { angle: ViralAngle }) {
  return (
    <Card interactive className="flex flex-col">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge tone="orange" icon="Compass">
          {angle.label}
        </Badge>
        <Badge tone="electric" icon="Send">
          {angle.platform}
        </Badge>
      </div>

      <h4 className="font-display text-base font-bold leading-snug text-ink">
        {angle.title}
      </h4>

      <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-purple-soft">
          <Icon name="Lightbulb" className="size-3.5" />
          למה זה עובד
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          {angle.whyItWorks}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line bg-surface-2 p-2.5">
          <div className="text-[11px] font-semibold text-ink-mute">
            רמת סיכון
          </div>
          <div className="mt-1">
            <Badge tone={RISK_TONE[angle.riskLevel]} icon="ShieldAlert">
              {angle.riskLevel}
            </Badge>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface-2 p-2.5">
          <div className="text-[11px] font-semibold text-ink-mute">
            רמת פוטנציאל
          </div>
          <div className="mt-1">
            <Badge tone={POTENTIAL_TONE[angle.potentialLevel]} icon="TrendingUp">
              {angle.potentialLevel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-pink/25 bg-pink/5 p-3">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-pink">
            <Icon name="Quote" className="size-3.5" />
            דוגמת פתיח
          </div>
          <CopyButton text={angle.exampleOpener} label="העתקי" />
        </div>
        <p className="text-sm font-medium leading-relaxed text-ink">
          “{angle.exampleOpener}”
        </p>
      </div>
    </Card>
  );
}
