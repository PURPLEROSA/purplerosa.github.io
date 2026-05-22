"use client";

import { useMemo, useState } from "react";
import {
  PageHeader,
  Card,
  Badge,
  Icon,
  Pill,
  EmptyState,
  type BadgeTone,
} from "@/components/ui";
import {
  mockCalendarEvents,
  mockIdeas,
  mockTrends,
  mockProjects,
  type CalendarEvent,
} from "@/lib/mock-data";
import {
  PLATFORM_LABELS,
  PLATFORM_ICON,
  CONTENT_TYPE_LABELS,
  IDEA_STATUS_LABELS,
} from "@/lib/constants";
import { CLASSIFICATION_LABELS, CLASSIFICATION_TONE } from "@/lib/scoring";
import { formatDateHe, formatDateShort, relativeTimeHe, dayNameHe } from "@/lib/utils";
import type { Idea, IdeaStatus, Platform, Trend, PriorityClassification } from "@/lib/types";

const TODAY = "2026-05-22";

/* ---------- מטא לכל סוג אירוע ---------- */
type EventType = CalendarEvent["type"];

const EVENT_META: Record<
  EventType,
  { label: string; icon: string; tone: BadgeTone; dot: string }
> = {
  publish: { label: "פרסום", icon: "Send", tone: "pink", dot: "bg-pink" },
  lecture: { label: "הרצאה", icon: "Presentation", tone: "purple", dot: "bg-purple" },
  shoot: { label: "צילום", icon: "Video", tone: "electric", dot: "bg-electric" },
  meeting: { label: "פגישה", icon: "Users", tone: "orange", dot: "bg-orange" },
  deadline: { label: "דדליין", icon: "Flag", tone: "pink", dot: "bg-pink" },
};

/* ---------- בוררי תצוגה ---------- */
type ViewKey = "weekly" | "monthly" | "platform" | "status" | "priority";

const VIEWS: { key: ViewKey; label: string; icon: string }[] = [
  { key: "weekly", label: "שבועי", icon: "CalendarRange" },
  { key: "monthly", label: "חודשי", icon: "CalendarDays" },
  { key: "platform", label: "לפי פלטפורמה", icon: "Share2" },
  { key: "status", label: "לפי סטטוס", icon: "ListChecks" },
  { key: "priority", label: "לפי עדיפות", icon: "Flame" },
];

/* ---------- ההמלצות החכמות ---------- */
const SMART_RECS: {
  icon: string;
  tone: BadgeTone;
  title: string;
  detail: string;
}[] = [
  {
    icon: "Zap",
    tone: "pink",
    title: "היום מתאים לפוסט קצר ומהיר",
    detail: "יש לך פוסט סמכות שיושב מוכן. תפרסמי אותו בבוקר וסיימת את היום החשוב בעשר דקות.",
  },
  {
    icon: "Award",
    tone: "purple",
    title: "השבוע כדאי להעלות תוכן סמכות מקצועי",
    detail: "פרסמת הרבה תוכן קליל לאחרונה. עכשיו תורו של פוסט דעתני אחד שמבסס מיצוב.",
  },
  {
    icon: "Flame",
    tone: "orange",
    title: "יש לך טרנד חם שלא כדאי לפספס",
    detail: "טרנד מודלי הווידאו פרץ הבוקר עם דחיפות 88 — חלון התגובה נסגר תוך 48 שעות.",
  },
  {
    icon: "MousePointerClick",
    tone: "electric",
    title: "יש לך רעיון כמעט מוכן שצריך רק CTA",
    detail: "קרוסלת ה-Workflow מוכנה ב-78%. חסרים הוק ו-CTA — פחות מחצי שעת עבודה.",
  },
];

/* ---------- עזרי תאריך ---------- */
function startOfWeek(iso: string): Date {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
function isoOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const [view, setView] = useState<ViewKey>("weekly");

  /* ----- מקורות מחושבים ----- */
  const sortedEvents = useMemo(
    () => [...mockCalendarEvents].sort((a, b) => a.date.localeCompare(b.date)),
    []
  );

  const plannedIdeas = useMemo(
    () => mockIdeas.filter((i) => i.publishDate),
    []
  );

  const readyIdeas = useMemo(
    () =>
      mockIdeas
        .filter((i) => i.status === "ready" || i.status === "almost-ready")
        .sort((a, b) => b.readiness - a.readiness),
    []
  );

  const deadlineEvents = useMemo(
    () => sortedEvents.filter((e) => e.type === "deadline"),
    [sortedEvents]
  );

  const projectDeadlines = useMemo(
    () =>
      mockProjects
        .filter((p) => p.deadline)
        .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1)),
    []
  );

  const lectureEvents = useMemo(
    () => sortedEvents.filter((e) => e.type === "lecture"),
    [sortedEvents]
  );

  const recycleIdeas = useMemo(
    () => mockIdeas.filter((i) => i.classificationLabel === "recycle"),
    []
  );

  const shortWindowTrends = useMemo(
    () =>
      mockTrends
        .filter((t) => t.urgencyScore >= 70 && t.finalDecision !== "ignore")
        .sort((a, b) => b.urgencyScore - a.urgencyScore),
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon="CalendarDays"
        title="יומן פרסום"
        subtitle="לוח הפיקוד של הפרסום שלך — מה יוצא, מתי, ולמה דווקא עכשיו."
      >
        <Badge tone="pink" icon="Send">
          {plannedIdeas.length + sortedEvents.filter((e) => e.type === "publish").length} פרסומים מתוכננים
        </Badge>
        <Badge tone="purple" icon="CalendarClock">
          {sortedEvents.length} אירועים ביומן
        </Badge>
      </PageHeader>

      {/* ===== המלצות חכמות ===== */}
      <Card glow className="relative animate-fade-up overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-purple/15 blur-3xl" />
        <div className="relative">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-gradient text-white">
              <Icon name="Sparkles" className="size-4" />
            </span>
            <h2 className="font-display text-base font-bold text-ink">המלצות חכמות</h2>
          </div>
          <p className="mb-4 text-xs text-ink-mute">
            לא רק יומן — אסטרטגית התוכן שלך לוחשת לך מה כדאי לזוז עליו עכשיו.
          </p>
          <div className="grid gap-2.5 md:grid-cols-2">
            {SMART_RECS.map((rec) => (
              <div
                key={rec.title}
                className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-3.5 transition-all hover:border-purple/40"
              >
                <div
                  className={cnTone(rec.tone)}
                >
                  <Icon name={rec.icon} className="size-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-ink">{rec.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{rec.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ===== בורר תצוגה ===== */}
      <Card className="animate-fade-up">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="LayoutGrid" className="size-4 text-purple-soft" />
          <h2 className="font-display text-sm font-bold text-ink">איך להסתכל על היומן</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={
                view === v.key
                  ? "inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-3.5 py-2 text-xs font-semibold text-white shadow-glow transition-all"
                  : "inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 px-3.5 py-2 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
              }
            >
              <Icon name={v.icon} className="size-3.5" />
              {v.label}
            </button>
          ))}
        </div>
      </Card>

      {/* ===== תצוגה פעילה ===== */}
      <div className="animate-fade-up">
        {view === "weekly" && <WeeklyView events={sortedEvents} ideas={plannedIdeas} />}
        {view === "monthly" && <MonthlyView events={sortedEvents} />}
        {view === "platform" && <PlatformView events={sortedEvents} />}
        {view === "status" && <StatusView />}
        {view === "priority" && <PriorityView />}
      </div>

      {/* ===== שורות פיקוד רוחביות ===== */}
      <div className="grid animate-fade-up gap-5 lg:grid-cols-2">
        {/* מוכן לפרסום */}
        <CommandCard icon="CheckCircle2" title="מוכן לפרסום עכשיו" accent="lime" count={readyIdeas.length}>
          {readyIdeas.length ? (
            <div className="space-y-2.5">
              {readyIdeas.map((i) => (
                <div key={i.id} className="rounded-xl border border-lime/20 bg-lime/5 p-3">
                  <p className="text-sm font-semibold text-ink line-clamp-1">{i.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone="lime" icon="Check">
                      מוכנות {i.readiness}%
                    </Badge>
                    <Badge tone="mute" icon={PLATFORM_ICON[i.platform]}>
                      {PLATFORM_LABELS[i.platform]}
                    </Badge>
                    <Badge tone="mute">{IDEA_STATUS_LABELS[i.status]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="CheckCircle2" title="אין כרגע תוכן מוכן" />
          )}
        </CommandCard>

        {/* טרנדים עם חלון קצר */}
        <CommandCard icon="Radar" title="טרנדים עם חלון זמן קצר" accent="orange" count={shortWindowTrends.length}>
          {shortWindowTrends.length ? (
            <div className="space-y-2.5">
              {shortWindowTrends.map((t) => (
                <TrendRow key={t.id} trend={t} />
              ))}
            </div>
          ) : (
            <EmptyState icon="Radar" title="אין טרנדים דחופים פתוחים" />
          )}
        </CommandCard>

        {/* דדליינים */}
        <CommandCard icon="Flag" title="דדליינים שמתקרבים" accent="pink" count={deadlineEvents.length + projectDeadlines.length}>
          <div className="space-y-2">
            {deadlineEvents.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-2.5 rounded-xl border border-pink/20 bg-pink/5 p-2.5"
              >
                <Icon name="Flag" className="size-4 shrink-0 text-pink" />
                <span className="flex-1 text-sm text-ink-soft line-clamp-1">{e.title}</span>
                <span className="shrink-0 text-[11px] font-semibold text-ink-mute">
                  {formatDateShort(e.date)} · {relativeTimeHe(e.date)}
                </span>
              </div>
            ))}
            {projectDeadlines.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2 p-2.5"
              >
                <Icon name="FolderKanban" className="size-4 shrink-0 text-purple-soft" />
                <span className="flex-1 text-sm text-ink-soft line-clamp-1">{p.name}</span>
                <span className="shrink-0 text-[11px] font-semibold text-ink-mute">
                  {formatDateShort(p.deadline)} · {relativeTimeHe(p.deadline)}
                </span>
              </div>
            ))}
          </div>
        </CommandCard>

        {/* הרצאות קרובות */}
        <CommandCard icon="Presentation" title="הרצאות קרובות" accent="purple" count={lectureEvents.length}>
          {lectureEvents.length ? (
            <div className="space-y-2">
              {lectureEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl border border-purple/20 bg-purple/5 p-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-purple-soft">
                    <Icon name="Presentation" className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink line-clamp-1">{e.title}</p>
                    <p className="text-[11px] text-ink-mute">
                      {formatDateHe(e.date)} · {relativeTimeHe(e.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="Presentation" title="אין הרצאות ביומן" />
          )}
        </CommandCard>

        {/* תאריכי פרסום מומלצים */}
        <CommandCard icon="CalendarCheck" title="תאריכי פרסום מומלצים" accent="electric" count={plannedIdeas.length}>
          {plannedIdeas.length ? (
            <div className="space-y-2">
              {plannedIdeas.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-3 rounded-xl border border-electric/20 bg-electric/5 p-3"
                >
                  <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-white/5 text-electric">
                    <span className="font-display text-sm font-bold leading-none">
                      {formatDateShort(i.publishDate)}
                    </span>
                    <span className="mt-0.5 text-[9px] text-ink-mute">
                      {i.publishDate ? dayNameHe(i.publishDate) : ""}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink line-clamp-1">{i.title}</p>
                    <p className="text-[11px] text-ink-mute">
                      {PLATFORM_LABELS[i.platform]} · {relativeTimeHe(i.publishDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="CalendarCheck" title="אין עדיין תאריכי פרסום" />
          )}
        </CommandCard>

        {/* תוכן ששווה למחזר */}
        <CommandCard icon="RefreshCw" title="תוכן ששווה למחזר" accent="electric" count={recycleIdeas.length}>
          {recycleIdeas.length ? (
            <div className="space-y-2.5">
              {recycleIdeas.map((i) => (
                <div key={i.id} className="rounded-xl border border-line bg-surface-2 p-3">
                  <p className="text-sm font-semibold text-ink line-clamp-1">{i.title}</p>
                  <p className="mt-1 text-xs text-ink-soft line-clamp-2">{i.recommendedAction}</p>
                  <div className="mt-2">
                    <Badge tone={CLASSIFICATION_TONE[i.classificationLabel]} icon="RefreshCw">
                      {CLASSIFICATION_LABELS[i.classificationLabel]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="RefreshCw" title="אין כרגע תוכן למחזור" />
          )}
        </CommandCard>
      </div>

      {/* הערת עקרון */}
      <div className="animate-fade-up rounded-2xl border border-line bg-surface-2/50 p-4 text-center text-sm text-ink-mute">
        יומן פרסום טוב לא רק מראה מתי — הוא אומר לך מה כדאי שייצא, ומגן על חלונות
        הפרסום שלך כמו על פגישות אמיתיות.
      </div>
    </div>
  );
}

/* ============================================================= */
/* תצוגות                                                         */
/* ============================================================= */

/** תצוגה שבועית — ימי השבוע סביב התאריך הנוכחי. */
function WeeklyView({ events, ideas }: { events: CalendarEvent[]; ideas: Idea[] }) {
  const days = useMemo(() => {
    const start = startOfWeek(TODAY);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = isoOf(d);
      return {
        iso,
        dayName: dayNameHe(iso),
        short: formatDateShort(iso),
        isToday: iso === TODAY,
        events: events.filter((e) => e.date === iso),
        ideas: ideas.filter((i) => i.publishDate === iso),
      };
    });
  }, [events, ideas]);

  const weekStart = days[0];
  const weekEnd = days[6];

  return (
    <Card>
      <ViewHeader
        icon="CalendarRange"
        title="השבוע הנוכחי"
        sub={`${formatDateHe(weekStart.iso)} – ${formatDateHe(weekEnd.iso)}`}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {days.map((day) => (
          <div
            key={day.iso}
            className={
              day.isToday
                ? "rounded-xl border border-purple/45 bg-purple/8 p-3"
                : "rounded-xl border border-line bg-surface-2 p-3"
            }
          >
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="font-display text-sm font-bold text-ink">
                יום {day.dayName}
              </span>
              <span
                className={
                  day.isToday
                    ? "rounded-md bg-brand-gradient px-1.5 py-0.5 text-[10px] font-bold text-white"
                    : "text-[11px] font-semibold text-ink-mute"
                }
              >
                {day.isToday ? "היום" : day.short}
              </span>
            </div>
            {day.events.length === 0 && day.ideas.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line px-2 py-3 text-center text-[11px] text-ink-mute">
                יום פנוי
              </p>
            ) : (
              <div className="space-y-1.5">
                {day.events.map((e) => (
                  <EventChip key={e.id} event={e} />
                ))}
                {day.ideas.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-start gap-1.5 rounded-lg border border-pink/25 bg-pink/5 px-2 py-1.5"
                  >
                    <Icon name="Send" className="mt-0.5 size-3.5 shrink-0 text-pink" />
                    <span className="text-[11px] leading-snug text-ink-soft line-clamp-2">
                      {i.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/** תצוגה חודשית — כל האירועים מאי–יוני 2026 לפי תאריך. */
function MonthlyView({ events }: { events: CalendarEvent[] }) {
  const months = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const key = e.date.slice(0, 7);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [events]);

  return (
    <Card>
      <ViewHeader icon="CalendarDays" title="מבט חודשי" sub="כל האירועים, מסודרים לפי תאריך" />
      <div className="space-y-5">
        {months.map(([key, list]) => (
          <div key={key}>
            <div className="mb-2.5 flex items-center gap-2">
              <Icon name="Calendar" className="size-4 text-purple-soft" />
              <h3 className="font-display text-sm font-bold text-ink">
                {formatDateHe(`${key}-01`).replace(/^1 ב/, "")}
              </h3>
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-bold text-ink-mute">
                {list.length}
              </span>
            </div>
            <div className="space-y-2">
              {list.map((e) => {
                const meta = EVENT_META[e.type];
                const past = e.date < TODAY;
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3"
                  >
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-white/5">
                      <span className="font-display text-base font-bold leading-none text-ink">
                        {new Date(e.date).getDate()}
                      </span>
                      <span className="mt-0.5 text-[9px] text-ink-mute">
                        {dayNameHe(e.date)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={
                          past
                            ? "text-sm font-semibold text-ink-mute line-clamp-1"
                            : "text-sm font-semibold text-ink line-clamp-1"
                        }
                      >
                        {e.title}
                      </p>
                      <p className="text-[11px] text-ink-mute">{relativeTimeHe(e.date)}</p>
                    </div>
                    <Badge tone={meta.tone} icon={meta.icon}>
                      {meta.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** תצוגה לפי פלטפורמה — תוכן מתוכנן ואירועי פרסום מקובצים. */
function PlatformView({ events }: { events: CalendarEvent[] }) {
  const groups = useMemo(() => {
    const map = new Map<
      Platform,
      { ideas: Idea[]; events: CalendarEvent[] }
    >();
    mockIdeas
      .filter(
        (i) =>
          i.status === "ready" ||
          i.status === "almost-ready" ||
          i.status === "scheduled" ||
          i.publishDate
      )
      .forEach((i) => {
        if (!map.has(i.platform)) map.set(i.platform, { ideas: [], events: [] });
        map.get(i.platform)!.ideas.push(i);
      });
    // אירועי פרסום מקושרים לפלטפורמת המותג האישי — לינקדאין כברירת מחדל
    events
      .filter((e) => e.type === "publish")
      .forEach((e) => {
        const fallback: Platform = "linkedin";
        if (!map.has(fallback)) map.set(fallback, { ideas: [], events: [] });
        map.get(fallback)!.events.push(e);
      });
    return Array.from(map.entries()).sort(
      (a, b) =>
        b[1].ideas.length + b[1].events.length - (a[1].ideas.length + a[1].events.length)
    );
  }, [events]);

  return (
    <Card>
      <ViewHeader
        icon="Share2"
        title="תוכן מתוכנן לפי פלטפורמה"
        sub="איפה התוכן שלך מתרכז — ואיפה יש פערים"
      />
      <div className="grid gap-3 md:grid-cols-2">
        {groups.map(([platform, data]) => (
          <div key={platform} className="rounded-xl border border-line bg-surface-2 p-3.5">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-purple-soft">
                <Icon name={PLATFORM_ICON[platform]} className="size-4" />
              </div>
              <h3 className="font-display text-sm font-bold text-ink">
                {PLATFORM_LABELS[platform]}
              </h3>
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-bold text-ink-mute">
                {data.ideas.length + data.events.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {data.ideas.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-2 rounded-lg bg-base/40 px-2.5 py-2"
                >
                  <Icon name="Lightbulb" className="size-3.5 shrink-0 text-orange" />
                  <span className="flex-1 text-[12px] text-ink-soft line-clamp-1">
                    {i.title}
                  </span>
                  <Pill>{CONTENT_TYPE_LABELS[i.contentType]}</Pill>
                </div>
              ))}
              {data.events.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-2 rounded-lg bg-base/40 px-2.5 py-2"
                >
                  <Icon name="Send" className="size-3.5 shrink-0 text-pink" />
                  <span className="flex-1 text-[12px] text-ink-soft line-clamp-1">
                    {e.title}
                  </span>
                  <Pill>{formatDateShort(e.date)}</Pill>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** תצוגה לפי סטטוס — קיבוץ רעיונות לפי שלב. */
function StatusView() {
  const STATUS_ORDER: IdeaStatus[] = [
    "ready",
    "almost-ready",
    "scheduled",
    "in-progress",
    "inbox",
    "published",
    "parked",
  ];
  const STATUS_TONE: Record<IdeaStatus, BadgeTone> = {
    ready: "lime",
    "almost-ready": "purple",
    scheduled: "electric",
    "in-progress": "orange",
    inbox: "mute",
    published: "electric",
    parked: "mute",
  };

  const groups = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        items: mockIdeas.filter((i) => i.status === status),
      })).filter((g) => g.items.length > 0),
    []
  );

  return (
    <Card>
      <ViewHeader
        icon="ListChecks"
        title="תוכן לפי שלב"
        sub="מה מוכן, מה בעבודה, ומה עוד מחכה בתיבה"
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <div key={g.status} className="rounded-xl border border-line bg-surface-2 p-3.5">
            <div className="mb-2.5 flex items-center gap-2">
              <Badge tone={STATUS_TONE[g.status]} icon="Circle">
                {IDEA_STATUS_LABELS[g.status]}
              </Badge>
              <span className="text-[11px] font-bold text-ink-mute">{g.items.length}</span>
            </div>
            <div className="space-y-1.5">
              {g.items.map((i) => (
                <div key={i.id} className="rounded-lg bg-base/40 px-2.5 py-2">
                  <p className="text-[12px] font-medium text-ink-soft line-clamp-2">
                    {i.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-ink-mute">
                    <Icon name={PLATFORM_ICON[i.platform]} className="size-3" />
                    {PLATFORM_LABELS[i.platform]} · מוכנות {i.readiness}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** תצוגה לפי עדיפות — קיבוץ לפי סיווג, ממוין לפי ציון. */
function PriorityView() {
  const groups = useMemo(() => {
    const map = new Map<PriorityClassification, Idea[]>();
    [...mockIdeas]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .forEach((i) => {
        if (!map.has(i.classificationLabel)) map.set(i.classificationLabel, []);
        map.get(i.classificationLabel)!.push(i);
      });
    return Array.from(map.entries()).sort(
      (a, b) => (b[1][0]?.priorityScore ?? 0) - (a[1][0]?.priorityScore ?? 0)
    );
  }, []);

  return (
    <Card>
      <ViewHeader
        icon="Flame"
        title="תוכן לפי עדיפות"
        sub="מה דורש תשומת לב עכשיו — ומה יכול לחכות"
      />
      <div className="space-y-4">
        {groups.map(([cls, items]) => (
          <div key={cls}>
            <div className="mb-2 flex items-center gap-2">
              <Badge tone={CLASSIFICATION_TONE[cls]} icon="Target">
                {CLASSIFICATION_LABELS[cls]}
              </Badge>
              <span className="text-[11px] font-bold text-ink-mute">{items.length} פריטים</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3"
                >
                  <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-white/5">
                    <span className="font-display text-sm font-bold leading-none text-purple-soft">
                      {i.priorityScore}
                    </span>
                    <span className="text-[8px] text-ink-mute">ציון</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink line-clamp-1">{i.title}</p>
                    <p className="text-[11px] text-ink-mute">
                      {PLATFORM_LABELS[i.platform]} · {CONTENT_TYPE_LABELS[i.contentType]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================================================= */
/* קומפוננטות עזר                                                 */
/* ============================================================= */

function ViewHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-purple-soft">
        <Icon name={icon} className="size-[18px]" />
      </div>
      <div>
        <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
        <p className="text-[11px] text-ink-mute">{sub}</p>
      </div>
    </div>
  );
}

/** צ'יפ אירוע צבעוני בתצוגה השבועית. */
function EventChip({ event }: { event: CalendarEvent }) {
  const meta = EVENT_META[event.type];
  return (
    <div className="flex items-start gap-1.5 rounded-lg border border-line bg-base/40 px-2 py-1.5">
      <span className={`mt-1 size-2 shrink-0 rounded-full ${meta.dot}`} />
      <Icon name={meta.icon} className="mt-0.5 size-3.5 shrink-0 text-ink-mute" />
      <span className="text-[11px] leading-snug text-ink-soft line-clamp-2">{event.title}</span>
    </div>
  );
}

/** שורת טרנד עם תווית חלון זמן קצר. */
function TrendRow({ trend }: { trend: Trend }) {
  return (
    <div className="rounded-xl border border-orange/25 bg-orange/5 p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-white/5">
          <span className="font-display text-sm font-bold leading-none text-orange">
            {trend.urgencyScore}
          </span>
          <span className="text-[8px] text-ink-mute">דחיפות</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink line-clamp-2">{trend.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="orange" icon="Hourglass">
              חלון זמן קצר
            </Badge>
            <Badge tone="mute" icon={PLATFORM_ICON[trend.recommendedPlatform]}>
              {PLATFORM_LABELS[trend.recommendedPlatform]}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

/** כרטיס פיקוד רוחבי עם כותרת מודגשת. */
function CommandCard({
  icon,
  title,
  accent,
  count,
  children,
}: {
  icon: string;
  title: string;
  accent: "purple" | "pink" | "orange" | "electric" | "lime";
  count: number;
  children: React.ReactNode;
}) {
  const accentText = {
    purple: "text-purple-soft",
    pink: "text-pink",
    orange: "text-orange",
    electric: "text-electric",
    lime: "text-lime",
  }[accent];
  return (
    <Card className="flex flex-col">
      <div className="mb-3.5 flex items-center gap-2">
        <Icon name={icon} className={`size-[18px] ${accentText}`} />
        <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-bold text-ink-mute">
          {count}
        </span>
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}

/** מחזיר קלאסים לאייקון ההמלצה לפי גוון. */
function cnTone(tone: BadgeTone): string {
  const map: Record<BadgeTone, string> = {
    purple: "bg-purple/15 text-purple-soft",
    pink: "bg-pink/15 text-pink",
    orange: "bg-orange/15 text-orange",
    electric: "bg-electric/15 text-electric",
    lime: "bg-lime/15 text-lime",
    mute: "bg-white/5 text-ink-mute",
  };
  return `flex size-10 shrink-0 items-center justify-center rounded-xl ${map[tone]}`;
}
