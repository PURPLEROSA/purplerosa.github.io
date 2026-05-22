import Link from "next/link";
import {
  Card,
  Badge,
  Icon,
  ScoreRing,
  UrgencyDot,
  Pill,
} from "@/components/ui";
import {
  mockNextActions,
  mockOpportunities,
  mockTrends,
  mockIdeas,
  mockProjects,
  mockWeeklyReviews,
  mockCalendarEvents,
} from "@/lib/mock-data";
import {
  PLATFORM_LABELS,
  TREND_DECISION_LABELS,
  IDEA_STATUS_LABELS,
  OPPORTUNITY_TYPE_LABELS,
} from "@/lib/constants";
import {
  URGENCY_LABELS,
  EFFORT_LABELS,
  CLASSIFICATION_LABELS,
  CLASSIFICATION_TONE,
} from "@/lib/scoring";
import { formatDateHe, relativeTimeHe, dayNameHe } from "@/lib/utils";

export const metadata = { title: "SHELLY OG — מרכז השליטה" };

/* ---------- עזרי עיצוב ---------- */

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "בוקר טוב, Shelly";
  if (h < 17) return "צהריים טובים, Shelly";
  if (h < 21) return "ערב טוב, Shelly";
  return "לילה טוב, Shelly";
}

function Section({
  icon,
  title,
  count,
  href,
  accent = "purple",
  children,
}: {
  icon: string;
  title: string;
  count?: number;
  href?: string;
  accent?: "purple" | "pink" | "orange" | "electric";
  children: React.ReactNode;
}) {
  const accentText = {
    purple: "text-purple-soft",
    pink: "text-pink",
    orange: "text-orange",
    electric: "text-electric",
  }[accent];
  return (
    <Card className="flex flex-col">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name={icon} className={`size-[18px] ${accentText}`} />
          <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
          {count !== undefined && (
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-bold text-ink-mute">
              {count}
            </span>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-0.5 text-[11px] font-semibold text-ink-mute transition-colors hover:text-purple-soft"
          >
            הכל
            <Icon name="ChevronLeft" className="size-3.5" />
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}

/* ---------- חישוב נתוני הדשבורד ---------- */

const today = "2026-05-22";

const topAction = mockNextActions[0];

const topOpportunities = [...mockOpportunities]
  .sort((a, b) => rankUrgency(b.importance) - rankUrgency(a.importance))
  .slice(0, 3);

const urgentTrends = mockTrends
  .filter((t) => t.urgencyScore >= 68 && t.finalDecision !== "ignore")
  .sort((a, b) => b.urgencyScore - a.urgencyScore);

const almostReadyIdeas = mockIdeas
  .filter((i) => i.status === "ready" || i.status === "almost-ready")
  .sort((a, b) => b.readiness - a.readiness);

const stuckIdeas = mockIdeas.filter(
  (i) => i.status === "in-progress" && i.readiness < 55
);
const stuckProjects = mockProjects.filter((p) => p.status === "stuck");

const waitingForHook = mockIdeas.filter((i) =>
  i.missingItems.some((m) => m.includes("הוק"))
);

const upcomingEvents = [...mockCalendarEvents]
  .filter((e) => e.date >= today)
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, 4);

const importantEmails = mockOpportunities
  .filter((o) => o.source === "gmail" && rankUrgency(o.importance) >= 2)
  .slice(0, 3);

const publishToday = mockIdeas.filter(
  (i) => i.classificationLabel === "publish-now" || i.publishDate === today
);

const notWorthTime = [
  ...mockIdeas
    .filter((i) => i.classificationLabel === "not-worth-time")
    .map((i) => ({ title: i.title, reason: i.recommendedAction })),
  ...mockTrends
    .filter((t) => t.finalDecision === "ignore")
    .map((t) => ({ title: t.title, reason: t.shellyPOV })),
];

const latestWeekly = mockWeeklyReviews[0];

function rankUrgency(u: string): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[u] ?? 0;
}

const EVENT_ICON: Record<string, string> = {
  lecture: "Presentation",
  shoot: "Video",
  meeting: "Users",
  deadline: "Flag",
  publish: "Send",
};

/* ============================================================= */

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* כותרת */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 text-sm text-ink-mute">
          <Icon name="Sparkles" className="size-4 text-purple-soft" />
          SHELLY OG — מרכז השליטה
        </div>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
          {greeting()}.
        </h1>
        <p className="mt-1 text-ink-soft">
          {formatDateHe(today)} · יום {dayNameHe(today)}. הנה מה שחשוב — ומה לא.
        </p>
      </div>

      {/* ===== הפעולה הכי חשובה עכשיו ===== */}
      <Card glow className="relative animate-fade-up overflow-hidden">
        <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-purple/20 blur-3xl" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="pink" icon="Zap">
              הפעולה הכי חשובה עכשיו
            </Badge>
            <Badge tone="orange" icon="Clock">
              דחיפות {URGENCY_LABELS[topAction.urgency]}
            </Badge>
            <Badge tone="purple" icon="Gauge">
              מאמץ: {EFFORT_LABELS[topAction.effort]}
            </Badge>
            <Badge tone="electric" icon="Send">
              {PLATFORM_LABELS[topAction.platform]}
            </Badge>
          </div>

          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
            {topAction.title}
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-pink">
                <Icon name="Flame" className="size-3.5" />
                למה זה חשוב עכשיו
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">
                {topAction.whyNow}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-purple-soft">
                <Icon name="Compass" className="size-3.5" />
                סיבה אסטרטגית
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">
                {topAction.strategicReason}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Icon name="ArrowLeftCircle" className="size-4 text-orange" />
            <span className="text-sm font-semibold text-ink">הצעד הבא:</span>
            <span className="text-sm text-ink-soft">{topAction.nextStep}</span>
          </div>

          <Link
            href="/now"
            className="so-btn-primary mt-5 w-full sm:w-auto"
          >
            <Icon name="Target" className="size-4" />
            פתחי את מסך "מה לעשות עכשיו"
          </Link>
        </div>
      </Card>

      {/* ===== שורת סטטיסטיקה ===== */}
      <div className="grid animate-fade-up grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "מוכן לפרסום", value: publishToday.length, icon: "Send", tone: "pink" },
          { label: "טרנדים דחופים", value: urgentTrends.length, icon: "Radar", tone: "orange" },
          { label: "כמעט מוכן", value: almostReadyIdeas.length, icon: "Lightbulb", tone: "purple" },
          { label: "הזדמנויות פתוחות", value: mockOpportunities.length, icon: "Mail", tone: "electric" },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 !p-4">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${
                { pink: "text-pink", orange: "text-orange", purple: "text-purple-soft", electric: "text-electric" }[
                  s.tone
                ]
              }`}
            >
              <Icon name={s.icon} className="size-5" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-ink">
                {s.value}
              </div>
              <div className="text-xs text-ink-mute">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* ===== גריד ראשי ===== */}
      <div className="grid animate-fade-up gap-5 lg:grid-cols-3">
        {/* 3 הזדמנויות חזקות */}
        <Section
          icon="TrendingUp"
          title="שלוש ההזדמנויות הכי חזקות היום"
          accent="pink"
          href="/now"
        >
          <div className="space-y-2.5">
            {topOpportunities.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-line bg-surface-2 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink line-clamp-2">
                    {o.title}
                  </span>
                  <UrgencyDot urgency={o.importance} />
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge tone="electric">{OPPORTUNITY_TYPE_LABELS[o.type]}</Badge>
                  <span className="text-[11px] text-ink-mute">{o.from}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* טרנדים דחופים */}
        <Section
          icon="Radar"
          title="טרנדים שחייבים תגובה מהירה"
          count={urgentTrends.length}
          accent="orange"
          href="/trends"
        >
          <div className="space-y-2.5">
            {urgentTrends.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3"
              >
                <ScoreRing score={t.urgencyScore} size={44} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink line-clamp-2">
                    {t.title}
                  </p>
                  <div className="mt-1">
                    <Badge tone="orange" icon="Zap">
                      {TREND_DECISION_LABELS[t.finalDecision]}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* כמעט מוכן */}
        <Section
          icon="Lightbulb"
          title="רעיונות כמעט מוכנים לפרסום"
          count={almostReadyIdeas.length}
          accent="purple"
          href="/ideas"
        >
          <div className="space-y-2.5">
            {almostReadyIdeas.map((i) => (
              <div
                key={i.id}
                className="rounded-xl border border-line bg-surface-2 p-3"
              >
                <p className="text-sm font-semibold text-ink line-clamp-2">
                  {i.title}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Badge tone={CLASSIFICATION_TONE[i.classificationLabel]}>
                    {CLASSIFICATION_LABELS[i.classificationLabel]}
                  </Badge>
                  <span className="text-[11px] font-bold text-purple-soft">
                    מוכנות {i.readiness}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* פוסטים שמחכים רק להוק */}
        <Section
          icon="Anchor"
          title="פוסטים שמחכים רק להוק"
          count={waitingForHook.length}
          accent="electric"
          href="/studio"
        >
          {waitingForHook.length ? (
            <div className="space-y-2.5">
              {waitingForHook.map((i) => (
                <div
                  key={i.id}
                  className="rounded-xl border border-line bg-surface-2 p-3"
                >
                  <p className="text-sm font-semibold text-ink line-clamp-2">
                    {i.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {i.missingItems.map((m) => (
                      <Pill key={m}>חסר: {m}</Pill>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-mute">אין פריטים שתקועים על הוק.</p>
          )}
        </Section>

        {/* תכנים תקועים */}
        <Section
          icon="AlertTriangle"
          title="תכנים תקועים"
          count={stuckIdeas.length + stuckProjects.length}
          accent="orange"
        >
          <div className="space-y-2.5">
            {stuckProjects.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-orange/25 bg-orange/5 p-3"
              >
                <p className="text-sm font-semibold text-ink line-clamp-1">
                  {p.name}
                </p>
                <p className="mt-0.5 text-[11px] text-orange">
                  פרויקט תקוע · {p.nextStep}
                </p>
              </div>
            ))}
            {stuckIdeas.map((i) => (
              <div
                key={i.id}
                className="rounded-xl border border-line bg-surface-2 p-3"
              >
                <p className="text-sm font-semibold text-ink line-clamp-1">
                  {i.title}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-mute">
                  {IDEA_STATUS_LABELS[i.status]} · מוכנות {i.readiness}%
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* אירועים קרובים */}
        <Section
          icon="CalendarDays"
          title="אירועים קרובים מהיומן"
          accent="purple"
          href="/calendar"
        >
          <div className="space-y-2">
            {upcomingEvents.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-2.5"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-purple-soft">
                  <Icon name={EVENT_ICON[e.type] ?? "Calendar"} className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink line-clamp-1">
                    {e.title}
                  </p>
                  <p className="text-[11px] text-ink-mute">
                    {relativeTimeHe(e.date)} · {formatDateHe(e.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ===== שורה תחתונה: מייל / השבוע / לפרסם / רעש ===== */}
      <div className="grid animate-fade-up gap-5 lg:grid-cols-2">
        {/* פניות חשובות מהמייל */}
        <Section
          icon="Mail"
          title="פניות חשובות מהמייל"
          count={importantEmails.length}
          accent="electric"
          href="/settings"
        >
          <div className="space-y-2.5">
            {importantEmails.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-line bg-surface-2 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink line-clamp-1">
                    {o.title}
                  </span>
                  <Badge tone="electric">{OPPORTUNITY_TYPE_LABELS[o.type]}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-soft line-clamp-2">
                  {o.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* מה עבדתי עליו השבוע */}
        <Section
          icon="History"
          title="מה עבדתי עליו השבוע"
          accent="purple"
          href="/weekly"
        >
          <div className="space-y-2">
            {latestWeekly.activeProjects.map((p) => (
              <div
                key={p}
                className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2"
              >
                <Icon name="FolderKanban" className="size-4 text-purple-soft" />
                <span className="text-sm text-ink-soft">{p}</span>
              </div>
            ))}
            <div className="mt-2 rounded-xl border border-purple/25 bg-purple/5 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-purple-soft">
                <Icon name="Sparkles" className="size-3.5" />
                התובנה האסטרטגית של השבוע
              </div>
              <p className="text-xs leading-relaxed text-ink-soft line-clamp-3">
                {latestWeekly.strategicInsight}
              </p>
            </div>
          </div>
        </Section>

        {/* מה כדאי לפרסם היום */}
        <Section
          icon="Send"
          title="מה כדאי לפרסם היום"
          count={publishToday.length}
          accent="pink"
          href="/calendar"
        >
          <div className="space-y-2.5">
            {publishToday.map((i) => (
              <div
                key={i.id}
                className="rounded-xl border border-pink/25 bg-pink/5 p-3"
              >
                <p className="text-sm font-semibold text-ink line-clamp-1">
                  {i.title}
                </p>
                <p className="mt-1 text-xs text-ink-soft line-clamp-2">
                  {i.recommendedAction}
                </p>
                <div className="mt-2">
                  <Badge tone="pink" icon="Check">
                    מוכן {i.readiness}% · {PLATFORM_LABELS[i.platform]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* מה לא שווה את הזמן שלי */}
        <Section
          icon="Ban"
          title="מה לא שווה את הזמן שלי"
          count={notWorthTime.length}
          accent="orange"
        >
          <div className="space-y-2">
            {notWorthTime.map((n) => (
              <div
                key={n.title}
                className="rounded-xl border border-line bg-surface-2/60 p-3"
              >
                <p className="text-sm font-medium text-ink-mute line-clamp-1 line-through decoration-ink-mute/40">
                  {n.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-mute line-clamp-2">
                  {n.reason}
                </p>
              </div>
            ))}
            <p className="pt-1 text-[11px] text-ink-mute">
              להתעלם זו החלטה. מי שמסננת רעש — מתפנה לדברים שבאמת חשובים.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
