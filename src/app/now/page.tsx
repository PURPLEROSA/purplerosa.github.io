"use client";

import { useMemo, useState } from "react";
import {
  PageHeader,
  Card,
  Badge,
  Icon,
  Button,
  Pill,
} from "@/components/ui";
import { AiResultView } from "@/components/shared/AiResultView";
import { useAi } from "@/components/shared/use-ai";
import { mockNextActions } from "@/lib/mock-data";
import { WORK_MODES, PLATFORM_LABELS } from "@/lib/constants";
import { URGENCY_LABELS, EFFORT_LABELS } from "@/lib/scoring";
import type { WorkMode, NextAction } from "@/lib/types";

/** כפתורי הפעולה במסך — חלקם קוראים ל-AI, חלקם פעולות מקומיות. */
const ACTION_BUTTONS: {
  id: string;
  label: string;
  icon: string;
  task?: string;
  local?: "save" | "done";
}[] = [
  { id: "script", label: "תני לי תסריט", icon: "FileText", task: "tiktok-script" },
  { id: "linkedin", label: "הפכי לפוסט לינקדאין", icon: "Linkedin", task: "linkedin-post" },
  { id: "carousel", label: "הפכי לקרוסלה", icon: "GalleryHorizontalEnd", task: "carousel" },
  { id: "hooks", label: "תני לי 5 הוקים", icon: "Anchor", task: "hooks" },
  { id: "reels", label: "צרי רעיון לרילס", icon: "Clapperboard", task: "reels-script" },
  { id: "visual", label: "צרי פרומפט ויזואלי", icon: "ImagePlus", task: "visual-prompt" },
  { id: "save", label: "שמרי לאחר כך", icon: "Bookmark", local: "save" },
  { id: "done", label: "סמני כבוצע", icon: "CheckCircle2", local: "done" },
];

function rankUrgency(u: string): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[u] ?? 0;
}
function rankEffort(e: string): number {
  return { "15min": 1, "30min": 2, "1hour": 3, "deep-work": 4 }[e] ?? 0;
}

export default function NowPage() {
  const [mode, setMode] = useState<WorkMode | "all">("all");
  const [saved, setSaved] = useState(false);
  const [done, setDone] = useState(false);
  const ai = useAi();

  /** הפעולות הרלוונטיות למצב הנבחר, ממוינות לפי דחיפות ואז מאמץ. */
  const actions = useMemo(() => {
    const filtered =
      mode === "all"
        ? mockNextActions
        : mockNextActions.filter((a) => a.relatedMode.includes(mode));
    const list = filtered.length ? filtered : mockNextActions;
    return [...list].sort((a, b) => {
      const u = rankUrgency(b.urgency) - rankUrgency(a.urgency);
      if (u !== 0) return u;
      return rankEffort(a.effort) - rankEffort(b.effort);
    });
  }, [mode]);

  const primary: NextAction = actions[0];
  const secondary = actions.slice(1);

  function handleAction(btn: (typeof ACTION_BUTTONS)[number]) {
    if (btn.local === "save") {
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
      return;
    }
    if (btn.local === "done") {
      setDone(true);
      return;
    }
    if (btn.task) {
      ai.run(
        btn.task,
        primary.title,
        `פלטפורמה: ${PLATFORM_LABELS[primary.platform]} · ${primary.strategicReason}`
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon="Target"
        title="מה לעשות עכשיו"
        subtitle="פעולה אחת ברורה. בלי עומס החלטות. בלי רעש."
      />

      {/* ===== בורר מצב עבודה ===== */}
      <Card className="animate-fade-up">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="SlidersHorizontal" className="size-4 text-purple-soft" />
          <h2 className="font-display text-sm font-bold text-ink">
            היום אני במצב...
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <ModeChip
            active={mode === "all"}
            icon="LayoutGrid"
            label="כל המצבים"
            onClick={() => setMode("all")}
          />
          {WORK_MODES.map((m) => (
            <ModeChip
              key={m.value}
              active={mode === m.value}
              icon={m.icon}
              label={m.label}
              onClick={() => setMode(m.value)}
            />
          ))}
        </div>
      </Card>

      {/* ===== הפעולה הראשית ===== */}
      <Card glow className="relative animate-fade-up overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-pink/15 blur-3xl" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="pink" icon="Star">
              הפעולה המומלצת
            </Badge>
            <Badge tone="orange" icon="Clock">
              דחיפות {URGENCY_LABELS[primary.urgency]}
            </Badge>
            <Badge tone="purple" icon="Gauge">
              מאמץ: {EFFORT_LABELS[primary.effort]}
            </Badge>
            <Badge tone="electric" icon="Send">
              {PLATFORM_LABELS[primary.platform]}
            </Badge>
            {done && (
              <Badge tone="lime" icon="Check">
                סומן כבוצע
              </Badge>
            )}
          </div>

          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
            {primary.title}
          </h2>

          {/* רשת הנימוקים */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoBlock
              icon="Flame"
              tone="text-pink"
              title="למה זה חשוב עכשיו"
              text={primary.whyNow}
            />
            <InfoBlock
              icon="Fingerprint"
              tone="text-purple-soft"
              title="למה זה מתאים למותג שלך"
              text={primary.whyOnBrand}
            />
            <InfoBlock
              icon="Compass"
              tone="text-electric"
              title="הסיבה האסטרטגית"
              text={primary.strategicReason}
            />
            <InfoBlock
              icon="ArrowLeftCircle"
              tone="text-orange"
              title="הצעד הבא"
              text={primary.nextStep}
            />
          </div>

          {/* מה חסר */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Icon name="ClipboardList" className="size-4 text-ink-mute" />
              מה חסר כדי לפרסם:
            </span>
            {primary.whatsMissing.length ? (
              primary.whatsMissing.map((m) => <Pill key={m}>{m}</Pill>)
            ) : (
              <Badge tone="lime" icon="Check">
                שום דבר — אפשר לפרסם
              </Badge>
            )}
          </div>

          {/* כפתורי פעולה */}
          <div className="mt-5">
            <div className="mb-2 text-xs font-bold text-ink-mute">
              בחרי פעולה — ואני אכינה לך את זה עכשיו:
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ACTION_BUTTONS.map((btn) => (
                <Button
                  key={btn.id}
                  variant={
                    btn.id === "done"
                      ? "primary"
                      : btn.local
                        ? "subtle"
                        : "ghost"
                  }
                  icon={btn.icon}
                  loading={ai.loading && ai.activeTask === btn.task}
                  onClick={() => handleAction(btn)}
                  className="!justify-start"
                >
                  {btn.id === "save" && saved ? "נשמר ✓" : btn.label}
                </Button>
              ))}
            </div>
          </div>

          {/* תוצאת AI */}
          {ai.error && (
            <p className="mt-4 rounded-xl border border-pink/30 bg-pink/10 p-3 text-sm text-pink">
              {ai.error}
            </p>
          )}
          {ai.result && (
            <div className="mt-4">
              <AiResultView result={ai.result} />
            </div>
          )}
        </div>
      </Card>

      {/* ===== פעולות נוספות ===== */}
      {secondary.length > 0 && (
        <div className="animate-fade-up">
          <h2 className="so-section-title mb-3 flex items-center gap-2">
            <Icon name="ListTodo" className="size-5 text-purple-soft" />
            פעולות נוספות שכדאי לשקול
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {secondary.map((a) => (
              <Card key={a.id} interactive>
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone="orange">
                    דחיפות {URGENCY_LABELS[a.urgency]}
                  </Badge>
                  <Badge tone="purple">{EFFORT_LABELS[a.effort]}</Badge>
                  <Badge tone="electric">
                    {PLATFORM_LABELS[a.platform]}
                  </Badge>
                </div>
                <h3 className="font-display text-base font-bold text-ink">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft line-clamp-2">
                  {a.whyNow}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-ink-mute">
                  <Icon name="ArrowLeftCircle" className="size-3.5 text-orange" />
                  {a.nextStep}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* הערת עקרון */}
      <div className="animate-fade-up rounded-2xl border border-line bg-surface-2/50 p-4 text-center text-sm text-ink-mute">
        SHELLY OG לא רק מארגנת מידע — היא אומרת לך מה חשוב עכשיו ומה הצעד הבא.
        פעולה אחת בכל פעם. ככה זזים מהר.
      </div>
    </div>
  );
}

/* ---------- קומפוננטות עזר ---------- */

function ModeChip({
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
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-xs font-semibold text-white shadow-glow transition-all"
          : "inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 px-3 py-2 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
      }
    >
      <Icon name={icon} className="size-3.5" />
      {label}
    </button>
  );
}

function InfoBlock({
  icon,
  tone,
  title,
  text,
}: {
  icon: string;
  tone: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3">
      <div className={`mb-1 flex items-center gap-1.5 text-xs font-bold ${tone}`}>
        <Icon name={icon} className="size-3.5" />
        {title}
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}
