"use client";

import { useMemo, useState } from "react";
import {
  PageHeader,
  Card,
  Badge,
  Icon,
  Stat,
  EmptyState,
} from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { mockWeeklyReviews } from "@/lib/mock-data";
import { formatDateHe } from "@/lib/utils";
import type { WeeklyReview } from "@/lib/types";

/* ---------- הגדרת מקטעי הדוח ---------- */

interface SectionDef {
  key: keyof Pick<
    WeeklyReview,
    | "activeProjects"
    | "newIdeas"
    | "readyToPublish"
    | "publishedContent"
    | "stuckContent"
    | "identifiedTrends"
    | "missedTrends"
    | "notWorthContinuing"
    | "makeSeries"
    | "lectureMaterial"
    | "nextWeekPublishing"
  >;
  title: string;
  icon: string;
  accent: SectionAccent;
  empty: string;
}

type SectionAccent = "purple" | "pink" | "orange" | "electric" | "lime";

const SECTIONS: SectionDef[] = [
  {
    key: "activeProjects",
    title: "על מה עבדתי השבוע",
    icon: "FolderKanban",
    accent: "purple",
    empty: "לא תועדו פרויקטים פעילים השבוע.",
  },
  {
    key: "newIdeas",
    title: "מה נכנס למערכת",
    icon: "Lightbulb",
    accent: "electric",
    empty: "לא נקלטו רעיונות חדשים השבוע.",
  },
  {
    key: "readyToPublish",
    title: "מה מוכן לפרסום",
    icon: "CheckCircle2",
    accent: "lime",
    empty: "אין כרגע תוכן שיושב מוכן לפרסום.",
  },
  {
    key: "publishedContent",
    title: "מה פורסם",
    icon: "Send",
    accent: "pink",
    empty: "לא פורסם תוכן השבוע.",
  },
  {
    key: "stuckContent",
    title: "מה תקוע",
    icon: "AlertTriangle",
    accent: "orange",
    empty: "שום דבר לא תקוע — נקי.",
  },
  {
    key: "identifiedTrends",
    title: "אילו טרנדים זוהו",
    icon: "Radar",
    accent: "electric",
    empty: "לא זוהו טרנדים חדשים השבוע.",
  },
  {
    key: "missedTrends",
    title: "אילו טרנדים פספסתי",
    icon: "EyeOff",
    accent: "orange",
    empty: "לא פוספס שום טרנד — תזמון מצוין.",
  },
  {
    key: "notWorthContinuing",
    title: "מה לא שווה המשך",
    icon: "Ban",
    accent: "orange",
    empty: "אין מה למחוק — הכל רלוונטי.",
  },
  {
    key: "makeSeries",
    title: "מה כדאי להפוך לסדרה",
    icon: "GalleryHorizontalEnd",
    accent: "purple",
    empty: "אין כרגע מועמד לסדרה.",
  },
  {
    key: "lectureMaterial",
    title: "מה מתאים להרצאה",
    icon: "Presentation",
    accent: "electric",
    empty: "אין כרגע חומר שמסומן להרצאה.",
  },
  {
    key: "nextWeekPublishing",
    title: "מה כדאי לפרסם בשבוע הבא",
    icon: "CalendarClock",
    accent: "pink",
    empty: "לא תוכנן פרסום לשבוע הבא.",
  },
];

const ACCENT_TEXT: Record<SectionAccent, string> = {
  purple: "text-purple-soft",
  pink: "text-pink",
  orange: "text-orange",
  electric: "text-electric",
  lime: "text-lime",
};

const ACCENT_TONE: Record<SectionAccent, BadgeTone> = {
  purple: "purple",
  pink: "pink",
  orange: "orange",
  electric: "electric",
  lime: "lime",
};

/* ============================================================= */

export default function WeeklyPage() {
  /** דוחות ממוינים — החדש ביותר ראשון. */
  const reviews = useMemo(
    () =>
      [...mockWeeklyReviews].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      ),
    []
  );

  const [selectedId, setSelectedId] = useState<string>(reviews[0]?.id ?? "");
  const review = reviews.find((r) => r.id === selectedId) ?? reviews[0];

  if (!review) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon="BarChart3"
          title="דוח שבועי"
          subtitle="סיכום, תובנות והמלצות — התמונה הגדולה של השבוע."
        />
        <EmptyState
          icon="BarChart3"
          title="אין עדיין דוחות"
          description="ברגע שיצטבר שבוע עבודה, הסיכום יופיע כאן."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon="BarChart3"
        title="דוח שבועי"
        subtitle="לא ערימת נתונים — תדריך חד שאומר לך מה עבד, מה לא, ומה עכשיו."
      >
        {/* בורר שבועות */}
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="appearance-none rounded-xl border border-line-strong bg-surface-2 px-4 py-2.5 pl-9 text-sm font-semibold text-ink outline-none transition-colors hover:border-purple/50 focus:border-purple"
          >
            {reviews.map((r, i) => (
              <option key={r.id} value={r.id}>
                {r.week}
                {i === 0 ? " — השבוע האחרון" : ""}
              </option>
            ))}
          </select>
          <Icon
            name="ChevronDown"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-mute"
          />
        </div>
      </PageHeader>

      {/* כותרת השבוע */}
      <div className="animate-fade-up flex flex-wrap items-center gap-2.5">
        <Badge tone="purple" icon="CalendarRange">
          {review.week}
        </Badge>
        <span className="text-xs text-ink-mute">
          הופק ב-{formatDateHe(review.createdAt)}
        </span>
      </div>

      {/* ===== שורת סטטיסטיקה ===== */}
      <div className="grid animate-fade-up grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat
          label="רעיונות שנכנסו"
          value={review.newIdeas.length}
          icon="Lightbulb"
          tone="electric"
        />
        <Stat
          label="מוכן לפרסום"
          value={review.readyToPublish.length}
          icon="CheckCircle2"
          tone="purple"
        />
        <Stat
          label="פורסם השבוע"
          value={review.publishedContent.length}
          icon="Send"
          tone="pink"
        />
        <Stat
          label="תקוע"
          value={review.stuckContent.length}
          icon="AlertTriangle"
          tone="orange"
        />
        <Stat
          label="טרנדים שזוהו"
          value={review.identifiedTrends.length}
          icon="Radar"
          tone="electric"
        />
      </div>

      {/* ===== גריד מקטעי הדוח ===== */}
      <div className="grid animate-fade-up gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <ReportSection
            key={s.key}
            def={s}
            items={review[s.key]}
          />
        ))}
      </div>

      {/* ===== שלוש פעולות מומלצות ===== */}
      <Card className="animate-fade-up">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="ListChecks" className="size-5 text-pink" />
          <h2 className="font-display text-base font-bold text-ink">
            שלוש פעולות מומלצות
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {review.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-line bg-surface-2 p-4"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient font-display text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink-soft">{rec}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ===== הפעולה הכי חשובה ===== */}
      <Card glow className="relative animate-fade-up overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-pink/15 blur-3xl" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <Badge tone="pink" icon="Star">
              הפעולה הכי חשובה לשבוע הבא
            </Badge>
          </div>
          <p className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl">
            {review.topAction}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-mute">
            <Icon name="Target" className="size-3.5 text-pink" />
            אם תספיקי רק דבר אחד מהשבוע הבא — שזה יהיה זה.
          </p>
        </div>
      </Card>

      {/* ===== המלצת SHELLY OG לשבוע הבא ===== */}
      <Card
        glow
        className="relative animate-fade-up overflow-hidden border-purple/40"
      >
        <div className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-purple/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 size-56 rounded-full bg-pink/15 blur-3xl" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <Icon name="Sparkles" className="size-5" />
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">
                התובנה האסטרטגית
              </div>
              <h2 className="so-gradient-text font-display text-lg font-extrabold">
                המלצת SHELLY OG לשבוע הבא
              </h2>
            </div>
          </div>
          <p className="text-base leading-relaxed text-ink">
            {review.strategicInsight}
          </p>
          <div className="mt-4 flex items-center gap-1.5 border-t border-line pt-3 text-xs text-ink-mute">
            <Icon name="Compass" className="size-3.5 text-purple-soft" />
            פחות רעש, יותר כיוון. זאת ההמלצה שמייצרת את ההבדל בשבוע הבא.
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------- קומפוננטת מקטע ---------- */

function ReportSection({
  def,
  items,
}: {
  def: SectionDef;
  items: string[];
}) {
  return (
    <Card className="flex flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon
            name={def.icon}
            className={`size-[18px] ${ACCENT_TEXT[def.accent]}`}
          />
          <h3 className="font-display text-sm font-bold text-ink">
            {def.title}
          </h3>
        </div>
        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-bold text-ink-mute">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-1 flex-col gap-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2"
            >
              <Icon
                name="Dot"
                className={`mt-0.5 size-4 shrink-0 ${ACCENT_TEXT[def.accent]}`}
              />
              <span className="text-sm leading-relaxed text-ink-soft">
                {item}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-dashed border-line px-3 py-3">
          <Icon name="Minus" className="size-3.5 text-ink-mute" />
          <span className="text-xs text-ink-mute">{def.empty}</span>
        </div>
      )}
    </Card>
  );
}
