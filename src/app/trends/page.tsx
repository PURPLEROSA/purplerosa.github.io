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
import { mockTrends } from "@/lib/mock-data";
import {
  TREND_TYPE_LABELS,
  TREND_CATEGORY_LABELS,
  TREND_DECISION_LABELS,
  SOURCE_LABELS,
  SOURCE_ICON,
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
} from "@/lib/constants";
import { EFFORT_LABELS } from "@/lib/scoring";
import { formatDateHe, relativeTimeHe } from "@/lib/utils";
import type { Trend, TrendType, TrendCategory, TrendDecision } from "@/lib/types";

/* ---------- מקורות סריקה ---------- */
const SCAN_SOURCES: { key: string; label: string; icon: string }[] = [
  { key: "gmail", label: "Gmail", icon: "Mail" },
  { key: "drive", label: "Google Drive", icon: "HardDrive" },
  { key: "docs", label: "Google Docs", icon: "FileText" },
  { key: "sheets", label: "Google Sheets", icon: "Sheet" },
  { key: "calendar", label: "Google Calendar", icon: "Calendar" },
  { key: "links", label: "לינקים שמורים", icon: "Link" },
];

/* ---------- מיפויי צבע ---------- */
const TREND_TYPE_TONE: Record<TrendType, BadgeTone> = {
  passing: "orange",
  evergreen: "electric",
  "strategic-asset": "purple",
  noise: "mute",
};

const TREND_DECISION_TONE: Record<TrendDecision, BadgeTone> = {
  "publish-now": "pink",
  "create-today": "orange",
  "save-week": "electric",
  "save-lecture": "purple",
  ignore: "mute",
};

const DECISION_ICON: Record<TrendDecision, string> = {
  "publish-now": "Send",
  "create-today": "Sparkles",
  "save-week": "BookmarkPlus",
  "save-lecture": "Presentation",
  ignore: "Ban",
};

/* ---------- טיפוס תוצאת סריקה ---------- */
interface ScannedItem {
  id: string;
  source: string;
  title: string;
  snippet: string;
  capturedAt: string;
}
interface ScanResult {
  count: number;
  summary: string;
  items: ScannedItem[];
  mode: string;
}

/* ---------- קטגוריות לסינון ---------- */
const CATEGORY_KEYS = Object.keys(TREND_CATEGORY_LABELS) as TrendCategory[];

export default function TrendsPage() {
  /* --- מצב פאנל הסריקה --- */
  const [selectedSources, setSelectedSources] = useState<string[]>(["gmail"]);
  const [allSources, setAllSources] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  /* --- סינון קטגוריות --- */
  const [activeCategory, setActiveCategory] = useState<TrendCategory | "all">(
    "all"
  );

  /* --- כרטיסים פתוחים --- */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const sortedTrends = useMemo(
    () => [...mockTrends].sort((a, b) => b.priorityScore - a.priorityScore),
    []
  );

  const filteredTrends = useMemo(() => {
    if (activeCategory === "all") return sortedTrends;
    return sortedTrends.filter((t) => t.categories.includes(activeCategory));
  }, [sortedTrends, activeCategory]);

  const hotCount = mockTrends.filter(
    (t) => t.urgencyScore >= 70 && t.finalDecision !== "ignore"
  ).length;
  const noiseCount = mockTrends.filter((t) => t.trendType === "noise").length;
  const actionableCount = mockTrends.filter(
    (t) =>
      t.finalDecision === "publish-now" || t.finalDecision === "create-today"
  ).length;

  function toggleSource(key: string) {
    if (allSources) return;
    setSelectedSources((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  async function runScan() {
    const sources = allSources ? ["all"] : selectedSources;
    if (!allSources && sources.length === 0) {
      setScanError("בחרי לפחות מקור אחד לסריקה.");
      return;
    }
    setScanning(true);
    setScanError(null);
    setScanResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sources }),
      });
      if (!res.ok) throw new Error("scan failed");
      const data = (await res.json()) as ScanResult;
      setScanResult(data);
    } catch {
      setScanError("הסריקה נכשלה. בדקי חיבור ונסי שוב.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon="Radar"
        title="רדאר טרנדים"
        subtitle="מה חם ב-AI עכשיו — ומה רק רעש."
      />

      {/* ===== שורת מצב הרדאר ===== */}
      <div className="grid animate-fade-up grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "טרנדים על הרדאר", value: mockTrends.length, icon: "Radar", tone: "purple" },
          { label: "חמים — דורשים תגובה", value: hotCount, icon: "Flame", tone: "pink" },
          { label: "מוכנים לפעולה היום", value: actionableCount, icon: "Zap", tone: "orange" },
          { label: "סוננו כרעש", value: noiseCount, icon: "Ban", tone: "electric" },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3 !p-4">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${
                {
                  purple: "text-purple-soft",
                  pink: "text-pink",
                  orange: "text-orange",
                  electric: "text-electric",
                }[s.tone]
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

      {/* ===== פאנל סריקה ===== */}
      <Card glow className="relative animate-fade-up overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 size-56 rounded-full bg-purple/20 blur-3xl" />
        <div className="relative">
          <div className="mb-1 flex items-center gap-2">
            <Icon name="ScanLine" className="size-[18px] text-purple-soft" />
            <h2 className="font-display text-base font-bold text-ink">
              סרקי עכשיו
            </h2>
          </div>
          <p className="mb-3.5 text-sm text-ink-soft">
            בחרי מאיפה לסרוק חומר גלם — ואני אזהה מה כדאי להפוך לתוכן.
          </p>

          {/* צ'יפ "הכל" */}
          <div className="mb-2.5">
            <SourceChip
              active={allSources}
              icon="Layers"
              label="הכל"
              onClick={() => {
                setAllSources((v) => !v);
              }}
            />
          </div>

          {/* צ'יפי מקורות */}
          <div
            className={`flex flex-wrap gap-2 transition-opacity ${
              allSources ? "opacity-40" : "opacity-100"
            }`}
          >
            {SCAN_SOURCES.map((s) => (
              <SourceChip
                key={s.key}
                active={!allSources && selectedSources.includes(s.key)}
                icon={s.icon}
                label={s.label}
                onClick={() => toggleSource(s.key)}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              icon="Radar"
              loading={scanning}
              onClick={runScan}
              className="w-full sm:w-auto"
            >
              {scanning ? "סורקת מקורות..." : "סרקי עכשיו"}
            </Button>
            <span className="text-xs text-ink-mute">
              סריקה בטוחה — קריאה בלבד, בלי לשנות שום דבר אצלך.
            </span>
          </div>

          {/* שגיאה */}
          {scanError && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-pink/30 bg-pink/10 p-3 text-sm text-pink">
              <Icon name="TriangleAlert" className="size-4 shrink-0" />
              {scanError}
            </p>
          )}

          {/* תוצאת סריקה */}
          {scanResult && (
            <div className="mt-4 animate-fade-up rounded-2xl border border-purple/25 bg-surface-2/80 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-brand-gradient text-white">
                  <Icon name="Check" className="size-4" />
                </span>
                <span className="text-sm font-bold text-ink">
                  הסריקה הושלמה
                </span>
                <Badge tone="purple" icon="FileStack">
                  {scanResult.count} פריטים
                </Badge>
                <Badge tone="lime" icon="ShieldCheck">
                  מצב {scanResult.mode === "live" ? "חי" : "הדגמה"}
                </Badge>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-ink-soft">
                {scanResult.summary}
              </p>
              {scanResult.items.length > 0 ? (
                <div className="space-y-2">
                  {scanResult.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-purple-soft">
                        <Icon
                          name={
                            SOURCE_ICON[
                              item.source as keyof typeof SOURCE_ICON
                            ] ?? "Inbox"
                          }
                          className="size-4"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-soft line-clamp-2">
                          {item.snippet}
                        </p>
                        <p className="mt-1 text-[11px] text-ink-mute">
                          {SOURCE_LABELS[
                            item.source as keyof typeof SOURCE_LABELS
                          ] ?? item.source}{" "}
                          · {relativeTimeHe(item.capturedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-mute">
                  לא נמצאו פריטים חדשים במקורות שנבחרו.
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ===== סינון קטגוריות ===== */}
      <div className="animate-fade-up">
        <div className="mb-2.5 flex items-center gap-2">
          <Icon name="Filter" className="size-4 text-purple-soft" />
          <h2 className="font-display text-sm font-bold text-ink">
            סינון לפי קטגוריה
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={activeCategory === "all"}
            label="הכל"
            onClick={() => setActiveCategory("all")}
          />
          {CATEGORY_KEYS.map((cat) => (
            <FilterChip
              key={cat}
              active={activeCategory === cat}
              label={TREND_CATEGORY_LABELS[cat]}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* ===== רשימת הטרנדים ===== */}
      <div className="animate-fade-up space-y-4">
        <h2 className="so-section-title flex items-center gap-2">
          <Icon name="Activity" className="size-5 text-purple-soft" />
          על הרדאר
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs font-bold text-ink-mute">
            {filteredTrends.length}
          </span>
        </h2>

        {filteredTrends.length === 0 ? (
          <EmptyState
            icon="Radar"
            title="אין טרנדים בקטגוריה הזו"
            description="נסי קטגוריה אחרת, או הריצי סריקה חדשה כדי לאתר חומר טרי."
          />
        ) : (
          filteredTrends.map((trend) => (
            <TrendCard
              key={trend.id}
              trend={trend}
              open={!!expanded[trend.id]}
              onToggle={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [trend.id]: !prev[trend.id],
                }))
              }
            />
          ))
        )}
      </div>

      {/* הערת עקרון */}
      <div className="animate-fade-up rounded-2xl border border-line bg-surface-2/50 p-4 text-center text-sm text-ink-mute">
        רדאר טרנדים לא נועד להלחיץ אותך עם חדשות. הוא נועד להגיד לך מה שווה את
        הזמן שלך — ומה לתת לעבור.
      </div>
    </div>
  );
}

/* ============================================================= */
/* ---------- כרטיס טרנד ---------- */
function TrendCard({
  trend,
  open,
  onToggle,
}: {
  trend: Trend;
  open: boolean;
  onToggle: () => void;
}) {
  const isNoise = trend.trendType === "noise";
  const isHot = trend.urgencyScore >= 75 && !isNoise;

  return (
    <Card
      glow={isHot}
      className={`relative overflow-hidden transition-all ${
        isNoise ? "opacity-65 hover:opacity-100" : ""
      }`}
    >
      {isHot && (
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-pink/15 blur-3xl" />
      )}
      <div className="relative">
        {/* שורה עליונה: ציון + כותרת + מחוון */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <ScoreRing score={trend.urgencyScore} size={58} />
            <span className="text-[10px] font-semibold text-ink-mute">
              דחיפות
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {isHot && (
                <Badge tone="pink" icon="Flame">
                  חם עכשיו
                </Badge>
              )}
              <Badge tone={TREND_TYPE_TONE[trend.trendType]} icon="Tag">
                {TREND_TYPE_LABELS[trend.trendType]}
              </Badge>
              <Badge
                tone={TREND_DECISION_TONE[trend.finalDecision]}
                icon={DECISION_ICON[trend.finalDecision]}
              >
                {TREND_DECISION_LABELS[trend.finalDecision]}
              </Badge>
            </div>

            <h3 className="font-display text-lg font-bold leading-snug text-ink">
              {trend.title}
            </h3>

            {/* מקור + קטגוריות */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Pill>
                <Icon
                  name={SOURCE_ICON[trend.source]}
                  className="size-3 text-ink-mute"
                />
                {SOURCE_LABELS[trend.source]} · {trend.sourceLabel}
              </Pill>
              {trend.categories.map((cat) => (
                <Pill key={cat}>{TREND_CATEGORY_LABELS[cat]}</Pill>
              ))}
            </div>
          </div>
        </div>

        {/* תקציר תמיד גלוי */}
        <Field
          icon="Newspaper"
          tone="text-electric"
          label="מה קרה?"
          text={trend.summary}
          className="mt-4"
        />

        {/* תצוגה מקדימה מקופלת — למה זה חשוב */}
        {!open && !isNoise && (
          <Field
            icon="Flame"
            tone="text-pink"
            label="למה זה חשוב?"
            text={trend.whyItMatters}
            className="mt-2.5"
          />
        )}

        {/* תוכן מורחב */}
        {open && (
          <div className="mt-2.5 space-y-2.5">
            <Field
              icon="Flame"
              tone="text-pink"
              label="למה זה חשוב?"
              text={trend.whyItMatters}
            />
            <Field
              icon="Users"
              tone="text-purple-soft"
              label="למי זה רלוונטי?"
              text={trend.whoIsItRelevantFor}
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Field
                icon="Clapperboard"
                tone="text-orange"
                label="למה זה חשוב ליוצרי תוכן?"
                text={trend.whyForCreators}
              />
              <Field
                icon="Building2"
                tone="text-electric"
                label="למה זה חשוב למותגים?"
                text={trend.whyForBrands}
              />
            </div>

            {/* הזווית של Shelly — מודגשת */}
            <div className="rounded-xl border border-purple/30 bg-purple/5 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-purple-soft">
                <Icon name="Fingerprint" className="size-3.5" />
                הזווית של Shelly
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">
                {trend.shellyPOV}
              </p>
            </div>

            {/* המלצת פורמט */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2 p-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink-mute">
                <Icon name="Wand2" className="size-3.5" />
                המלצת הפקה:
              </span>
              <Badge tone="purple" icon="LayoutTemplate">
                {CONTENT_TYPE_LABELS[trend.recommendedFormat]}
              </Badge>
              <Badge tone="electric" icon="Send">
                {PLATFORM_LABELS[trend.recommendedPlatform]}
              </Badge>
              <Badge tone="orange" icon="Gauge">
                מאמץ: {EFFORT_LABELS[trend.productionEffort]}
              </Badge>
            </div>

            {/* מה להגיד מול מצלמה */}
            {trend.cameraScript && trend.cameraScript !== "—" && (
              <Field
                icon="Video"
                tone="text-pink"
                label="מה להגיד מול מצלמה"
                text={trend.cameraScript}
              />
            )}

            {/* 5 הוקים */}
            {trend.hooks.length > 0 && (
              <div className="rounded-xl border border-line bg-surface-2 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange">
                  <Icon name="Anchor" className="size-3.5" />5 הוקים פותחים
                </div>
                <ol className="space-y-1.5">
                  {trend.hooks.map((hook, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink-soft">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-orange/15 text-[11px] font-bold text-orange">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{hook}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* CTA */}
            {trend.cta && trend.cta !== "—" && (
              <div className="flex items-start gap-2 rounded-xl border border-line bg-surface-2 p-3">
                <Icon
                  name="MousePointerClick"
                  className="mt-0.5 size-3.5 shrink-0 text-lime"
                />
                <div>
                  <span className="text-xs font-bold text-lime">
                    קריאה לפעולה:{" "}
                  </span>
                  <span className="text-sm text-ink-soft">{trend.cta}</span>
                </div>
              </div>
            )}

            {/* מטא תחתון */}
            <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-ink-mute">
              <Icon name="Clock3" className="size-3" />
              נקלט {formatDateHe(trend.createdAt)} · ציון עדיפות{" "}
              {trend.priorityScore}
            </div>
          </div>
        )}

        {/* כפתור הרחבה */}
        <button
          onClick={onToggle}
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 py-2 text-xs font-semibold text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
        >
          <Icon
            name={open ? "ChevronUp" : "ChevronDown"}
            className="size-3.5"
          />
          {open ? "סגרי ניתוח" : "פתחי ניתוח מלא"}
        </button>
      </div>
    </Card>
  );
}

/* ---------- שדה ניתוח מתויג ---------- */
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

/* ---------- צ'יפ מקור סריקה ---------- */
function SourceChip({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-xs font-semibold text-white shadow-glow transition-all"
          : "inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 px-3 py-2 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
      }
    >
      <Icon
        name={active ? "CheckCircle2" : icon}
        className="size-3.5"
      />
      {label}
    </button>
  );
}

/* ---------- צ'יפ סינון קטגוריה ---------- */
function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition-all"
          : "rounded-lg border border-line-strong bg-surface-2 px-3 py-1.5 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
      }
    >
      {label}
    </button>
  );
}
