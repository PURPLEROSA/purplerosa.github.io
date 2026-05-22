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
} from "@/components/ui";
import { mockIdeas, mockProjects } from "@/lib/mock-data";
import {
  IDEA_CLASSIFICATION_LABELS,
  IDEA_STATUS_LABELS,
  PLATFORM_LABELS,
  SOURCE_LABELS,
  SOURCE_ICON,
} from "@/lib/constants";
import { CLASSIFICATION_LABELS, CLASSIFICATION_TONE } from "@/lib/scoring";
import { relativeTimeHe, uid } from "@/lib/utils";
import type {
  Idea,
  IdeaClassification,
  IdeaStatus,
  ContentType,
  Platform,
} from "@/lib/types";

/* ---------- סוגי הוספה מהירה ---------- */
/** כל אפשרות בבורר הסוג ממופה לסיווג אוטומטי + סוג תוכן + פלטפורמת ברירת מחדל. */
const QUICK_ADD_TYPES: {
  id: string;
  label: string;
  icon: string;
  classification: IdeaClassification;
  contentType: ContentType;
  platform: Platform;
  action: string;
}[] = [
  {
    id: "idea",
    label: "רעיון",
    icon: "Lightbulb",
    classification: "post-idea",
    contentType: "post",
    platform: "linkedin",
    action: "לפתח את הזווית ולהחליט לאיזו פלטפורמה זה הכי מתאים.",
  },
  {
    id: "link",
    label: "לינק",
    icon: "Link",
    classification: "reference",
    contentType: "post",
    platform: "linkedin",
    action: "לעבור על הלינק ולסמן איזו זווית שווה לשלוף ממנו.",
  },
  {
    id: "prompt",
    label: "פרומפט",
    icon: "Terminal",
    classification: "prompt",
    contentType: "prompt",
    platform: "community",
    action: "לבדוק את הפרומפט, לשפר אותו ולשמור בספרייה.",
  },
  {
    id: "note",
    label: "הערה",
    icon: "StickyNote",
    classification: "reference",
    contentType: "post",
    platform: "linkedin",
    action: "להחליט אם ההערה הזו הופכת לתוכן או נשארת רפרנס.",
  },
  {
    id: "screenshot",
    label: "צילום מסך",
    icon: "Image",
    classification: "reference",
    contentType: "post",
    platform: "instagram",
    action: "לתייג את צילום המסך כדי שיהיה קל למצוא אותו אחר כך.",
  },
  {
    id: "file",
    label: "קובץ",
    icon: "File",
    classification: "project-asset",
    contentType: "post",
    platform: "linkedin",
    action: "לשייך את הקובץ לפרויקט הנכון או לשמור בספרייה.",
  },
  {
    id: "email",
    label: "מייל לשמירה",
    icon: "Mail",
    classification: "business-opportunity",
    contentType: "post",
    platform: "linkedin",
    action: "להחליט אם המייל דורש תשובה, הופך להזדמנות או רק נשמר.",
  },
  {
    id: "ai-update",
    label: "עדכון AI",
    icon: "Sparkles",
    classification: "trend",
    contentType: "post",
    platform: "linkedin",
    action: "לבדוק אם העדכון מצדיק תגובה מהירה — או רק שמירה.",
  },
  {
    id: "task",
    label: "משימה",
    icon: "CheckSquare",
    classification: "task",
    contentType: "post",
    platform: "linkedin",
    action: "לקבוע מתי זה קורה ומה הצעד הראשון.",
  },
  {
    id: "lecture",
    label: "נושא להרצאה",
    icon: "Presentation",
    classification: "lecture-material",
    contentType: "lecture",
    platform: "lecture",
    action: "לשבץ את הנושא במבנה ההרצאה ולחשוב על דמו תומך.",
  },
  {
    id: "recycle",
    label: "פוסט ישן למחזור",
    icon: "RefreshCw",
    classification: "future-content",
    contentType: "carousel",
    platform: "linkedin",
    action: "לחלץ את הליבה מהתוכן הישן ולעטוף אותו מחדש.",
  },
];

const STATUS_FILTERS: (IdeaStatus | "all")[] = [
  "all",
  "inbox",
  "in-progress",
  "almost-ready",
  "ready",
  "scheduled",
  "published",
  "parked",
];

const CLASSIFICATION_FILTERS = Object.keys(
  IDEA_CLASSIFICATION_LABELS
) as IdeaClassification[];

/* ============================================================= */

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [classFilter, setClassFilter] = useState<IdeaClassification | "all">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "all">("all");
  const [query, setQuery] = useState("");

  /* --- שדות טופס ההוספה --- */
  const [newType, setNewType] = useState(QUICK_ADD_TYPES[0].id);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [touched, setTouched] = useState(false);

  const projectName = (id: string | null) =>
    id ? mockProjects.find((p) => p.id === id)?.name ?? "—" : "—";

  function handleAdd() {
    setTouched(true);
    const title = newTitle.trim();
    if (!title) return;

    const typeDef =
      QUICK_ADD_TYPES.find((t) => t.id === newType) ?? QUICK_ADD_TYPES[0];
    const now = new Date().toISOString();

    const idea: Idea = {
      id: uid("idea"),
      title,
      description: newDesc.trim(),
      source: "manual",
      platform: typeDef.platform,
      contentType: typeDef.contentType,
      projectId: null,
      status: "inbox",
      classification: typeDef.classification,
      priorityScore: 50,
      classificationLabel: "save-later",
      urgency: "medium",
      readiness: 20,
      recommendedAction: typeDef.action,
      hook: null,
      caption: null,
      script: null,
      visualPrompt: null,
      cta: null,
      publishDate: null,
      tags: [typeDef.label],
      missingItems: ["סיווג ידני", "החלטה אם זה תוכן"],
      notes: "",
      createdAt: now,
      updatedAt: now,
    };

    setIdeas((prev) => [idea, ...prev]);
    setNewTitle("");
    setNewDesc("");
    setTouched(false);
  }

  /* --- סינון + מיון --- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ideas
      .filter((i) => classFilter === "all" || i.classification === classFilter)
      .filter((i) => statusFilter === "all" || i.status === statusFilter)
      .filter((i) => {
        if (!q) return true;
        return (
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [ideas, classFilter, statusFilter, query]);

  const readyCount = ideas.filter(
    (i) => i.readiness === 100 || i.status === "ready"
  ).length;
  const noiseCount = ideas.filter((i) => i.classification === "noise").length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon="Lightbulb"
        title="תיבת רעיונות"
        subtitle="כל רעיון, לינק, פרומפט והערה — במקום אחד. ועם דעה ברורה מה לעשות איתם."
      >
        <Badge tone="purple" icon="Inbox">
          {ideas.length} פריטים
        </Badge>
        <Badge tone="lime" icon="Send">
          {readyCount} מוכנים
        </Badge>
        {noiseCount > 0 && (
          <Badge tone="mute" icon="Ban">
            {noiseCount} רעש
          </Badge>
        )}
      </PageHeader>

      {/* ===== הוספה מהירה ===== */}
      <Card className="animate-fade-up">
        <div className="mb-3.5 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <Icon name="Plus" className="size-4" />
          </span>
          <div>
            <h2 className="font-display text-sm font-bold text-ink">
              הוספה מהירה
            </h2>
            <p className="text-[11px] text-ink-mute">
              זרקי פנים כל דבר — נסווג אותו ונגיד לך כמה הוא שווה.
            </p>
          </div>
        </div>

        {/* בורר סוג */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {QUICK_ADD_TYPES.map((t) => {
            const active = newType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setNewType(t.id)}
                className={
                  active
                    ? "inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-2.5 py-1.5 text-xs font-semibold text-white shadow-glow transition-all"
                    : "inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
                }
              >
                <Icon name={t.icon} className="size-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* שדות */}
        <div className="space-y-2.5">
          <div>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              placeholder="כותרת קצרה — מה הרעיון?"
              className="w-full rounded-xl border border-line-strong bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:border-purple/60 focus:outline-none"
            />
            {touched && !newTitle.trim() && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-pink">
                <Icon name="AlertCircle" className="size-3" />
                צריך כותרת כדי לשמור — אפילו שורה אחת.
              </p>
            )}
          </div>
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="תיאור (לא חובה) — הקשר, זווית, או למה זה תפס אותך."
            rows={2}
            className="w-full resize-none rounded-xl border border-line-strong bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:border-purple/60 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-ink-mute">
              נשמר אוטומטית בתיבה עם סיווג ראשוני — תמיד אפשר לחדד.
            </p>
            <Button icon="Plus" onClick={handleAdd}>
              הוסיפי לתיבה
            </Button>
          </div>
        </div>
      </Card>

      {/* ===== סינון וחיפוש ===== */}
      <Card className="animate-fade-up space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="Search" className="size-4 text-purple-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי כותרת, תיאור או תגית..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-mute focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-ink-mute transition-colors hover:text-ink"
            >
              <Icon name="X" className="size-4" />
            </button>
          )}
        </div>

        <div className="border-t border-line pt-3">
          <div className="mb-1.5 text-[11px] font-bold text-ink-mute">
            סיווג
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={classFilter === "all"}
              label="הכל"
              onClick={() => setClassFilter("all")}
            />
            {CLASSIFICATION_FILTERS.map((c) => (
              <FilterChip
                key={c}
                active={classFilter === c}
                label={IDEA_CLASSIFICATION_LABELS[c]}
                onClick={() => setClassFilter(c)}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-line pt-3">
          <div className="mb-1.5 text-[11px] font-bold text-ink-mute">
            סטטוס
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <FilterChip
                key={s}
                active={statusFilter === s}
                label={s === "all" ? "הכל" : IDEA_STATUS_LABELS[s]}
                onClick={() => setStatusFilter(s)}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* ===== רשימת הרעיונות ===== */}
      <div className="animate-fade-up">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="so-section-title flex items-center gap-2">
            <Icon name="ListChecks" className="size-5 text-purple-soft" />
            התיבה שלך
          </h2>
          <span className="text-xs text-ink-mute">
            {filtered.length} מתוך {ideas.length} · ממוין לפי עדיפות
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="SearchX"
            title="אין פריטים שתואמים לסינון"
            description="נקי את החיפוש או בחרי סיווג אחר — או פשוט הוסיפי רעיון חדש."
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {filtered.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                projectName={projectName(idea.projectId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- קומפוננטות עזר ---------- */

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
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-brand-gradient px-2.5 py-1 text-xs font-semibold text-white shadow-glow transition-all"
          : "rounded-lg border border-line-strong bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
      }
    >
      {label}
    </button>
  );
}

function IdeaCard({
  idea,
  projectName,
}: {
  idea: Idea;
  projectName: string;
}) {
  const isNoise = idea.classification === "noise";
  const isReady = idea.readiness === 100 || idea.status === "ready";

  return (
    <Card
      interactive
      className={isNoise ? "opacity-60" : undefined}
    >
      {/* ראש הכרטיס */}
      <div className="flex items-start gap-3.5">
        <ScoreRing score={idea.priorityScore} size={52} label />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold leading-snug text-ink">
            {idea.title}
          </h3>
          {idea.description && (
            <p className="mt-1 text-sm leading-relaxed text-ink-soft line-clamp-2">
              {idea.description}
            </p>
          )}
        </div>
      </div>

      {/* תגיות סיווג */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="purple" icon="Tag">
          {IDEA_CLASSIFICATION_LABELS[idea.classification]}
        </Badge>
        <Badge tone={CLASSIFICATION_TONE[idea.classificationLabel]} icon="Compass">
          {CLASSIFICATION_LABELS[idea.classificationLabel]}
        </Badge>
        <Badge tone="mute" icon="Activity">
          {IDEA_STATUS_LABELS[idea.status]}
        </Badge>
        {isReady ? (
          <Badge tone="lime" icon="CheckCircle2">
            מוכן לפרסום
          </Badge>
        ) : (
          <Badge tone="electric" icon="Gauge">
            מוכנות {idea.readiness}%
          </Badge>
        )}
      </div>

      {/* מטא */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line pt-3 text-xs">
        <MetaItem icon={SOURCE_ICON[idea.source]} label="מקור">
          {SOURCE_LABELS[idea.source]}
        </MetaItem>
        <MetaItem icon="Send" label="פלטפורמה">
          {PLATFORM_LABELS[idea.platform]}
        </MetaItem>
        <MetaItem icon="FolderKanban" label="פרויקט">
          <span className="line-clamp-1">{projectName}</span>
        </MetaItem>
        <MetaItem icon="Clock" label="עודכן">
          {relativeTimeHe(idea.updatedAt)}
        </MetaItem>
      </div>

      {/* תגיות */}
      {idea.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {idea.tags.map((t) => (
            <Pill key={t}># {t}</Pill>
          ))}
        </div>
      )}

      {/* פעולה הבאה */}
      <div className="mt-3 rounded-xl border border-purple/25 bg-purple/5 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-purple-soft">
          <Icon name="ArrowLeftCircle" className="size-3.5" />
          פעולה הבאה
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          {idea.recommendedAction}
        </p>
      </div>

      {/* מה חסר */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="flex items-center gap-1 text-xs font-semibold text-ink-mute">
          <Icon name="ClipboardList" className="size-3.5" />
          מה חסר:
        </span>
        {idea.missingItems.length > 0 ? (
          idea.missingItems.map((m) => <Pill key={m}>{m}</Pill>)
        ) : (
          <Badge tone="lime" icon="Check">
            שום דבר — אפשר לפרסם
          </Badge>
        )}
      </div>
    </Card>
  );
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-ink-soft">
      <Icon name={icon} className="size-3.5 shrink-0 text-ink-mute" />
      <span className="shrink-0 text-ink-mute">{label}:</span>
      <span className="min-w-0 truncate font-medium text-ink-soft">
        {children}
      </span>
    </div>
  );
}
