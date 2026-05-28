"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Badge, Icon } from "@/components/ui";
import { RefineChat } from "@/components/shared/RefineChat";
import { useToneProfile } from "@/components/shared/use-tone";
import { useLiveScan, itemsBySource } from "@/components/shared/use-live-scan";
import {
  mockDailyPosts,
  mockNews,
  mockTrends,
  mockOpportunities,
  mockCalendarEvents,
  mockIdeas,
  mockProjects,
  mockNextActions,
} from "@/lib/mock-data";
import {
  DAILY_POST_META,
  NEWS_CATEGORY_LABELS,
  PLATFORM_LABELS,
  OPPORTUNITY_TYPE_LABELS,
} from "@/lib/constants";
import { EFFORT_LABELS } from "@/lib/scoring";
import { formatDateHe, relativeTimeHe, dayNameHe } from "@/lib/utils";
import type { BadgeTone } from "@/components/ui";

const TODAY = "2026-05-22";

/* ---------- נתוני "לידיעתך" ---------- */
const urgentTrends = mockTrends
  .filter((t) => t.urgencyScore >= 68 && t.finalDecision !== "ignore")
  .sort((a, b) => b.urgencyScore - a.urgencyScore)
  .slice(0, 3);

const topOpportunities = [...mockOpportunities]
  .sort((a, b) => rankUrgency(b.importance) - rankUrgency(a.importance))
  .slice(0, 3);

const upcomingEvents = [...mockCalendarEvents]
  .filter((e) => e.date >= TODAY)
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, 3);

const stuckItems = [
  ...mockProjects
    .filter((p) => p.status === "stuck")
    .map((p) => ({ title: p.name, note: p.nextStep })),
  ...mockIdeas
    .filter((i) => i.status === "in-progress" && i.readiness < 55)
    .map((i) => ({ title: i.title, note: `מוכנות ${i.readiness}%` })),
];

const topAction = mockNextActions[0];

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
  const router = useRouter();
  const { context: toneContext } = useToneProfile();
  const scan = useLiveScan(["gmail", "calendar"]);
  const liveGmail = itemsBySource(scan.items, "gmail").slice(0, 6);
  const liveCalendar = itemsBySource(scan.items, "calendar").slice(0, 3);
  const showLive = scan.mode === "live";
  const [greet, setGreet] = useState("ברוכה הבאה, Shelly");
  const [question, setQuestion] = useState("");
  const [openPost, setOpenPost] = useState<string | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreet(
      h < 12
        ? "בוקר טוב, Shelly"
        : h < 17
          ? "צהריים טובים, Shelly"
          : h < 21
            ? "ערב טוב, Shelly"
            : "לילה טוב, Shelly"
    );
  }, []);

  function ask() {
    const q = question.trim();
    router.push(q ? `/ask?q=${encodeURIComponent(q)}` : "/ask");
  }

  return (
    <div className="space-y-7">
      {/* ===== כותרת ===== */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 text-sm text-ink-mute">
          <Icon name="Sparkles" className="size-4 text-purple-soft" />
          SHELLY OG — מרכז השליטה
        </div>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">
          {greet}.
        </h1>
        <p className="mt-1 text-ink-soft">
          {formatDateHe(TODAY)} · יום {dayNameHe(TODAY)}. הכנתי לך את הבוקר — מה
          לכתוב, מה קורה, ומה כדאי לדעת.
        </p>
      </div>

      {/* ===== שאלי את SHELLY OG ===== */}
      <Card glow className="relative animate-fade-up overflow-hidden">
        <div className="pointer-events-none absolute -left-20 -top-20 size-52 rounded-full bg-purple/20 blur-3xl" />
        <div className="relative">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <Icon name="MessagesSquare" className="size-4" />
            </span>
            <h2 className="font-display text-base font-bold text-ink">
              שאלי את SHELLY OG כל דבר
            </h2>
          </div>
          <p className="mb-3 text-sm text-ink-soft">
            שאלה חופשית — ואני עונה לך מתוך כל המידע שבמערכת: רעיונות, טרנדים,
            פרויקטים, חדשות והזדמנויות.
          </p>
          <div className="flex items-center gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="למשל: מה הכי דחוף שאעשה היום?"
              className="flex-1 rounded-xl border border-line-strong bg-surface-2 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-mute hover:border-purple/50 focus:border-purple"
            />
            <button onClick={ask} className="so-btn-primary shrink-0">
              <Icon name="ArrowLeft" className="size-4" />
              שאלי
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {["מה מוכן לפרסום?", "מה חם בטרנדים?", "על מה להתמקד השבוע?"].map(
              (q) => (
                <Link
                  key={q}
                  href={`/ask?q=${encodeURIComponent(q)}`}
                  className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11px] text-ink-mute transition-colors hover:border-purple/40 hover:text-ink"
                >
                  {q}
                </Link>
              )
            )}
          </div>
        </div>
      </Card>

      {/* ===== הכי דחוף — שורה דקה ===== */}
      <Link
        href="/now"
        className="flex animate-fade-up items-center gap-3 rounded-2xl border border-pink/30 bg-pink/5 p-3.5 transition-all hover:bg-pink/10"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pink/15 text-pink">
          <Icon name="Zap" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wide text-pink">
            הכי דחוף עכשיו
          </div>
          <div className="truncate text-sm font-semibold text-ink">
            {topAction.title}
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-pink">
          פתחי
          <Icon name="ChevronLeft" className="size-4" />
        </span>
      </Link>

      {/* ===== מחיצה: מה להכין היום (פעולות) ===== */}
      <SectionDivider
        icon="PenLine"
        title="מה להכין היום"
        hint="פעולות — לחצי 'כתבי' ואני כותבת לך את הפוסט"
        tone="action"
      />

      {/* 5 פוסטים להכין היום */}
      <div className="grid animate-fade-up gap-3 lg:grid-cols-2">
        {mockDailyPosts.map((dp, i) => {
          const meta = DAILY_POST_META[dp.kind];
          const open = openPost === dp.id;
          return (
            <Card key={dp.id} className="flex flex-col">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <span className="flex size-6 items-center justify-center rounded-lg bg-white/5 text-[11px] font-bold text-ink-mute">
                  {i + 1}
                </span>
                <Badge tone={meta.tone as BadgeTone} icon={meta.icon}>
                  {meta.label}
                </Badge>
                <Badge tone="purple">{EFFORT_LABELS[dp.effort]}</Badge>
                <Badge tone="electric">{PLATFORM_LABELS[dp.platform]}</Badge>
              </div>

              <h3 className="font-display text-base font-bold text-ink">
                {dp.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {dp.whyNow}
              </p>
              <div className="mt-2 flex items-start gap-1.5 text-xs text-ink-mute">
                <Icon
                  name="Compass"
                  className="mt-0.5 size-3.5 shrink-0 text-purple-soft"
                />
                <span>
                  <span className="font-semibold text-ink-soft">זווית:</span>{" "}
                  {dp.angle}
                </span>
              </div>

              <button
                onClick={() => setOpenPost(open ? null : dp.id)}
                className={
                  open
                    ? "so-btn-ghost mt-3.5 w-full"
                    : "so-btn-primary mt-3.5 w-full"
                }
              >
                <Icon name={open ? "ChevronUp" : "PenLine"} className="size-4" />
                {open ? "סגרי" : "כתבי את הפוסט"}
              </button>

              {open && (
                <div className="mt-3">
                  <RefineChat
                    seedTask={dp.seedTask}
                    seedInput={dp.seedInput}
                    tone={toneContext}
                    generateLabel="כתבי לי את הפוסט בקול שלי"
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* ===== 6 כותרות הבוקר ===== */}
      <Card className="animate-fade-up">
        <div className="mb-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="Newspaper" className="size-[18px] text-orange" />
            <h2 className="font-display text-base font-bold text-ink">
              6 כותרות הבוקר
            </h2>
            {showLive ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-lime/15 px-1.5 py-0.5 text-[11px] font-bold text-lime">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-lime" />
                חי מ-Gmail
              </span>
            ) : (
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-bold text-ink-mute">
                מתעדכן בכל כניסה
              </span>
            )}
          </div>
          <Link
            href="/news"
            className="flex items-center gap-0.5 text-xs font-semibold text-orange transition-colors hover:text-pink"
          >
            הפכי לפוסטים
            <Icon name="ChevronLeft" className="size-4" />
          </Link>
        </div>

        {scan.loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl border border-line bg-surface-2"
              />
            ))}
          </div>
        ) : showLive && liveGmail.length > 0 ? (
          <div className="space-y-2">
            {liveGmail.map((item, i) => (
              <a
                key={item.id}
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-2.5 transition-all hover:border-orange/40 hover:bg-surface-3"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange/15 font-display text-sm font-bold text-orange">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-ink-mute">
                    Gmail · {relativeTimeHe(item.capturedAt)}
                  </p>
                </div>
                <Icon
                  name="ExternalLink"
                  className="size-3.5 shrink-0 text-ink-mute"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[...mockNews]
              .sort((a, b) => a.rank - b.rank)
              .map((n) => (
                <Link
                  key={n.id}
                  href="/news"
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-2.5 transition-all hover:border-orange/40 hover:bg-surface-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-orange/15 font-display text-sm font-bold text-orange">
                    {n.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {n.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-[11px] text-ink-mute">
                        {NEWS_CATEGORY_LABELS[n.category]} · {n.source}
                      </span>
                      {n.worthPosting && (
                        <span className="text-[11px] font-semibold text-lime">
                          · שווה פוסט
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-orange">
                    <Icon name="Flame" className="size-3.5" />
                    {n.hotness}
                  </div>
                </Link>
              ))}
          </div>
        )}
      </Card>

      {/* ===== מחיצה: לידיעתך (מידע) ===== */}
      <SectionDivider
        icon="Info"
        title="לידיעתך"
        hint="מידע — לא דורש פעולה עכשיו, רק שתהיי מעודכנת"
        tone="info"
      />

      {/* גריד מידע */}
      <div className="grid animate-fade-up gap-4 lg:grid-cols-2">
        <InfoCard icon="Radar" title="טרנדים דחופים" href="/trends" hrefLabel="לרדאר">
          {urgentTrends.map((t) => (
            <InfoRow key={t.id} title={t.title}>
              <span className="flex items-center gap-1 text-[11px] font-bold text-orange">
                <Icon name="Flame" className="size-3" />
                {t.urgencyScore}
              </span>
            </InfoRow>
          ))}
        </InfoCard>

        <InfoCard icon="Mail" title="הזדמנויות מהמייל" href="/now" hrefLabel="לפעולות">
          {topOpportunities.map((o) => (
            <InfoRow key={o.id} title={o.title}>
              <span className="text-[11px] text-ink-mute">
                {OPPORTUNITY_TYPE_LABELS[o.type]}
              </span>
            </InfoRow>
          ))}
        </InfoCard>

        <InfoCard
          icon="CalendarDays"
          title="אירועים קרובים"
          href="/calendar"
          hrefLabel="ליומן"
        >
          {scan.loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-7 animate-pulse rounded-lg bg-surface-3 my-1"
              />
            ))
          ) : showLive && liveCalendar.length > 0 ? (
            liveCalendar.map((e) => (
              <a
                key={e.id}
                href={e.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-1 py-1.5 transition-colors hover:bg-surface-3"
              >
                <Icon
                  name="CalendarDays"
                  className="size-3.5 shrink-0 text-ink-mute"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                  {e.title}
                </span>
                <span className="text-[11px] text-ink-mute">
                  {relativeTimeHe(e.capturedAt)}
                </span>
              </a>
            ))
          ) : (
            upcomingEvents.map((e) => (
              <InfoRow key={e.id} title={e.title} icon={EVENT_ICON[e.type]}>
                <span className="text-[11px] text-ink-mute">
                  {relativeTimeHe(e.date)}
                </span>
              </InfoRow>
            ))
          )}
        </InfoCard>

        <InfoCard
          icon="AlertTriangle"
          title="תוכן תקוע"
          href="/projects"
          hrefLabel="לפרויקטים"
        >
          {stuckItems.length ? (
            stuckItems.map((s) => (
              <InfoRow key={s.title} title={s.title}>
                <span className="hidden text-[11px] text-ink-mute sm:block">
                  {s.note}
                </span>
              </InfoRow>
            ))
          ) : (
            <p className="px-1 py-2 text-sm text-ink-mute">
              שום דבר לא תקוע — נקי.
            </p>
          )}
        </InfoCard>
      </div>
    </div>
  );
}

/* ---------- קומפוננטות עזר ---------- */

function SectionDivider({
  icon,
  title,
  hint,
  tone,
}: {
  icon: string;
  title: string;
  hint: string;
  tone: "action" | "info";
}) {
  const isAction = tone === "action";
  return (
    <div className="flex animate-fade-up items-center gap-3">
      <span
        className={
          isAction
            ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow"
            : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-ink-mute"
        }
      >
        <Icon name={icon} className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <h2
          className={
            isAction
              ? "font-display text-lg font-bold text-ink"
              : "font-display text-lg font-bold text-ink-soft"
          }
        >
          {title}
        </h2>
        <p className="text-xs text-ink-mute">{hint}</p>
      </div>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  href,
  hrefLabel,
  children,
}: {
  icon: string;
  title: string;
  href: string;
  hrefLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2/50 p-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon name={icon} className="size-4 text-ink-mute" />
          <h3 className="text-sm font-bold text-ink-soft">{title}</h3>
        </div>
        <Link
          href={href}
          className="flex items-center gap-0.5 text-[11px] text-ink-mute transition-colors hover:text-purple-soft"
        >
          {hrefLabel}
          <Icon name="ChevronLeft" className="size-3.5" />
        </Link>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function InfoRow({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-1 py-1.5">
      <Icon name={icon ?? "Dot"} className="size-3.5 shrink-0 text-ink-mute" />
      <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
        {title}
      </span>
      {children}
    </div>
  );
}
