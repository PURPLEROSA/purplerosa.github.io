"use client";

import { useMemo, useState } from "react";
import {
  PageHeader,
  Card,
  Badge,
  Icon,
  Button,
  ScoreRing,
  Pill,
  EmptyState,
  type BadgeTone,
} from "@/components/ui";
import { RefineChat } from "@/components/shared/RefineChat";
import { useToneProfile } from "@/components/shared/use-tone";
import { mockNews } from "@/lib/mock-data";
import { NEWS_CATEGORY_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import type { NewsHeadline, NewsCategory } from "@/lib/types";

/* ---------- מיפוי צבע לקטגוריות ---------- */
const CATEGORY_TONE: Record<NewsCategory, BadgeTone> = {
  "ai-model": "purple",
  "ai-tool": "electric",
  "creator-economy": "pink",
  platform: "orange",
  industry: "lime",
  research: "purple",
};

const CATEGORY_ICON: Record<NewsCategory, string> = {
  "ai-model": "BrainCircuit",
  "ai-tool": "Wrench",
  "creator-economy": "Coins",
  platform: "LayoutGrid",
  industry: "Building2",
  research: "FlaskConical",
};

export default function NewsPage() {
  const { context } = useToneProfile();

  /* כרטיסים שנפתחה בהם כתיבת פוסט */
  const [openWriter, setOpenWriter] = useState<Record<string, boolean>>({});

  /* מיון לפי דירוג חשיבות 1→6 */
  const sortedNews = useMemo(
    () => [...mockNews].sort((a, b) => a.rank - b.rank),
    []
  );

  const worthCount = mockNews.filter((n) => n.worthPosting).length;
  const topHotness = mockNews.reduce((max, n) => Math.max(max, n.hotness), 0);

  function toggleWriter(id: string) {
    setOpenWriter((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon="Newspaper"
        title="חדשות הבוקר"
        subtitle="6 כותרות שבאמת חשובות להיום — והפיכה מהירה לפוסט בקול שלך."
      />

      {/* ===== שורת מצב הבריף ===== */}
      <div className="grid animate-fade-up grid-cols-3 gap-3">
        {[
          {
            label: "כותרות הבוקר",
            value: mockNews.length,
            icon: "Newspaper",
            tone: "purple" as const,
          },
          {
            label: "שוות פוסט היום",
            value: worthCount,
            icon: "PenLine",
            tone: "lime" as const,
          },
          {
            label: "החום הגבוה ביותר",
            value: topHotness,
            icon: "Flame",
            tone: "pink" as const,
          },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 !p-4">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${
                {
                  purple: "text-purple-soft",
                  lime: "text-lime",
                  pink: "text-pink",
                }[s.tone]
              }`}
            >
              <Icon name={s.icon} className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-2xl font-bold text-ink">
                {s.value}
              </div>
              <div className="truncate text-xs text-ink-mute">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* ===== כרטיס פתיחה ===== */}
      <Card glow className="relative animate-fade-up overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 size-56 rounded-full bg-purple/20 blur-3xl" />
        <div className="relative flex items-start gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Icon name="Sunrise" className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              הבריף שלך לבוקר
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              אלה 6 הכותרות שבאמת חשובות היום — מסודרות לפי חשיבות, מתרעננות
              כל בוקר. את לא צריכה לקרוא את כל האינטרנט. תעברי עליהן, תבחרי מה
              שווה פוסט, ותתני לשאר לעבור. כל כותרת אפשר להפוך לפוסט בקול שלך
              בלחיצה אחת.
            </p>
          </div>
        </div>
      </Card>

      {/* ===== רשימת הכותרות ===== */}
      <div className="animate-fade-up space-y-4">
        <h2 className="so-section-title flex items-center gap-2">
          <Icon name="ListOrdered" className="size-5 text-purple-soft" />
          הכותרות של היום
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs font-bold text-ink-mute">
            {sortedNews.length}
          </span>
        </h2>

        {sortedNews.length === 0 ? (
          <EmptyState
            icon="Newspaper"
            title="אין כותרות הבוקר"
            description="הבריף היומי יתרענן מחר בבוקר עם 6 כותרות טריות."
          />
        ) : (
          sortedNews.map((news) => (
            <NewsCard
              key={news.id}
              news={news}
              writerOpen={!!openWriter[news.id]}
              onToggleWriter={() => toggleWriter(news.id)}
              tone={context}
            />
          ))
        )}
      </div>

      {/* הערת עקרון */}
      <div className="animate-fade-up rounded-2xl border border-line bg-surface-2/50 p-4 text-center text-sm text-ink-mute">
        חדשות הבוקר לא נועדו להלחיץ אותך. הן נועדו לחסוך לך שעה של גלילה —
        ולתת לך פוסט מוכן בקול שלך לפני הקפה השני.
      </div>
    </div>
  );
}

/* ============================================================= */
/* ---------- כרטיס כותרת ---------- */
function NewsCard({
  news,
  writerOpen,
  onToggleWriter,
  tone,
}: {
  news: NewsHeadline;
  writerOpen: boolean;
  onToggleWriter: () => void;
  tone: string;
}) {
  const isHot = news.hotness >= 75;

  return (
    <Card
      glow={isHot}
      className="relative overflow-hidden transition-all"
    >
      {isHot && (
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-pink/15 blur-3xl" />
      )}
      <div className="relative">
        {/* שורה עליונה: דירוג + חום + כותרת */}
        <div className="flex items-start gap-4">
          {/* מספר דירוג גדול */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-gradient font-display text-2xl font-bold text-white shadow-glow">
              {news.rank}
            </div>
            <span className="text-[10px] font-semibold text-ink-mute">
              בבריף
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {isHot && (
                <Badge tone="pink" icon="Flame">
                  בוער עכשיו
                </Badge>
              )}
              <Badge
                tone={CATEGORY_TONE[news.category]}
                icon={CATEGORY_ICON[news.category]}
              >
                {NEWS_CATEGORY_LABELS[news.category]}
              </Badge>
              {news.worthPosting && (
                <Badge tone="lime" icon="CheckCircle2">
                  שווה פוסט
                </Badge>
              )}
            </div>

            <h3 className="font-display text-lg font-bold leading-snug text-ink">
              {news.title}
            </h3>

            {/* מקור */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Pill>
                <Icon name="Rss" className="size-3 text-ink-mute" />
                מקור: {news.source}
              </Pill>
            </div>
          </div>

          {/* מחוון חום */}
          <div className="flex shrink-0 flex-col items-center gap-1">
            <ScoreRing score={news.hotness} size={48} />
            <span className="text-[10px] font-semibold text-ink-mute">חום</span>
          </div>
        </div>

        {/* תקציר */}
        <Field
          icon="FileText"
          tone="text-electric"
          label="מה קרה"
          text={news.summary}
          className="mt-4"
        />

        {/* למה זה חשוב + הזווית שלך */}
        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
          <Field
            icon="Flame"
            tone="text-pink"
            label="למה זה חשוב"
            text={news.whyItMatters}
          />
          {/* הזווית שלך — מודגשת */}
          <div className="rounded-xl border border-purple/30 bg-purple/5 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-purple-soft">
              <Icon name="Fingerprint" className="size-3.5" />
              הזווית שלך
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              {news.suggestedAngle}
            </p>
          </div>
        </div>

        {/* פלטפורמה מומלצת */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2 p-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-ink-mute">
            <Icon name="Send" className="size-3.5" />
            הכי מתאים ל:
          </span>
          <Badge tone="electric" icon="Sparkles">
            {PLATFORM_LABELS[news.recommendedPlatform]}
          </Badge>
        </div>

        {/* כפתור הפיכה לפוסט */}
        <div className="mt-3.5">
          <Button
            icon={writerOpen ? "X" : "PenLine"}
            variant={writerOpen ? "ghost" : "primary"}
            onClick={onToggleWriter}
            className="w-full sm:w-auto"
          >
            {writerOpen ? "סגרי את הכתיבה" : "הפכי לפוסט ✍️"}
          </Button>
        </div>

        {/* כתיבת הפוסט — RefineChat אינליין */}
        {writerOpen && (
          <div className="mt-3.5 animate-fade-up">
            <RefineChat
              seedTask="news-to-post"
              seedInput={`${news.title}. ${news.summary}`}
              tone={tone}
              generateLabel="כתבי לי פוסט מהחדשה הזו"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

/* ---------- שדה מתויג ---------- */
function Field({
  icon,
  tone,
  label,
  text,
  className,
}: {
  icon: string;
  tone: string;
  label: string;
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface-2 p-3 ${
        className ?? ""
      }`}
    >
      <div className={`mb-1 flex items-center gap-1.5 text-xs font-bold ${tone}`}>
        <Icon name={icon} className="size-3.5" />
        {label}
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}
