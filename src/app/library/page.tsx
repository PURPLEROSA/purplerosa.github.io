"use client";

import { useMemo, useState } from "react";
import {
  PageHeader,
  Card,
  Badge,
  Icon,
  Stat,
  Pill,
  EmptyState,
  type BadgeTone,
} from "@/components/ui";
import { CopyButton } from "@/components/shared/CopyButton";
import { mockLibrary, mockProjects } from "@/lib/mock-data";
import {
  LIBRARY_TYPE_LABELS,
  PLATFORM_LABELS,
  CONTENT_TYPE_LABELS,
  SOURCE_LABELS,
  SOURCE_ICON,
} from "@/lib/constants";
import { relativeTimeHe } from "@/lib/utils";
import type {
  ContentLibraryItem,
  LibraryAssetType,
  Platform,
  PublishedStatus,
} from "@/lib/types";

/* ---------- תוויות סטטוס פרסום ---------- */
const PUBLISHED_STATUS_LABELS: Record<PublishedStatus, string> = {
  published: "פורסם",
  "unpublished-valuable": "לא פורסם אבל בעל ערך",
  draft: "טיוטה",
  ready: "מוכן",
};

const PUBLISHED_STATUS_TONE: Record<PublishedStatus, BadgeTone> = {
  published: "lime",
  "unpublished-valuable": "electric",
  draft: "mute",
  ready: "pink",
};

const PUBLISHED_STATUS_ICON: Record<PublishedStatus, string> = {
  published: "CheckCircle2",
  "unpublished-valuable": "Gem",
  draft: "FileEdit",
  ready: "Send",
};

const TYPE_FILTERS = Object.keys(LIBRARY_TYPE_LABELS) as LibraryAssetType[];
const PLATFORM_FILTERS = Object.keys(PLATFORM_LABELS) as Platform[];
const STATUS_FILTERS = Object.keys(
  PUBLISHED_STATUS_LABELS
) as PublishedStatus[];

/** מתגים מהירים — דגלים בוליאניים על הנכס. */
type QuickToggle = "readyToPublish" | "goodForRecycle" | "goodForLecture" | "duplicateFlag";
const QUICK_TOGGLES: { id: QuickToggle; label: string; icon: string }[] = [
  { id: "readyToPublish", label: "מוכן לפרסום", icon: "Send" },
  { id: "goodForRecycle", label: "מתאים למחזור", icon: "RefreshCw" },
  { id: "goodForLecture", label: "מתאים להרצאה", icon: "Presentation" },
  { id: "duplicateFlag", label: "כפילויות", icon: "Copy" },
];

/* ============================================================= */

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<LibraryAssetType | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PublishedStatus | "all">(
    "all"
  );
  const [toggles, setToggles] = useState<Record<QuickToggle, boolean>>({
    readyToPublish: false,
    goodForRecycle: false,
    goodForLecture: false,
    duplicateFlag: false,
  });

  const projectName = (id: string | null) =>
    id ? mockProjects.find((p) => p.id === id)?.name ?? null : null;

  function toggle(id: QuickToggle) {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function resetAll() {
    setQuery("");
    setTypeFilter("all");
    setPlatformFilter("all");
    setStatusFilter("all");
    setToggles({
      readyToPublish: false,
      goodForRecycle: false,
      goodForLecture: false,
      duplicateFlag: false,
    });
  }

  /* --- סטטיסטיקה --- */
  const stats = useMemo(
    () => ({
      total: mockLibrary.length,
      ready: mockLibrary.filter((i) => i.readyToPublish).length,
      recycle: mockLibrary.filter((i) => i.goodForRecycle).length,
      duplicates: mockLibrary.filter((i) => i.duplicateFlag).length,
    }),
    []
  );

  /* --- סינון --- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockLibrary.filter((i) => {
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      if (platformFilter !== "all" && i.platform !== platformFilter)
        return false;
      if (statusFilter !== "all" && i.publishedStatus !== statusFilter)
        return false;
      if (toggles.readyToPublish && !i.readyToPublish) return false;
      if (toggles.goodForRecycle && !i.goodForRecycle) return false;
      if (toggles.goodForLecture && !i.goodForLecture) return false;
      if (toggles.duplicateFlag && !i.duplicateFlag) return false;
      if (q) {
        const hit =
          i.assetName.toLowerCase().includes(q) ||
          i.notes.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [query, typeFilter, platformFilter, statusFilter, toggles]);

  const anyFilterActive =
    !!query ||
    typeFilter !== "all" ||
    platformFilter !== "all" ||
    statusFilter !== "all" ||
    Object.values(toggles).some(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader
        icon="Library"
        title="ספרייה"
        subtitle="כל הנכסים שלך — פרומפטים, תסריטים, הוקים, טיוטות — חיפוש שמוצא הכל."
      >
        {anyFilterActive && (
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface-2 px-3 py-1.5 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
          >
            <Icon name="X" className="size-3.5" />
            ניקוי סינון
          </button>
        )}
      </PageHeader>

      {/* ===== שורת סטטיסטיקה ===== */}
      <div className="grid animate-fade-up grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="נכסים בסך הכל"
          value={stats.total}
          icon="Boxes"
          tone="purple"
        />
        <Stat
          label="מוכנים לפרסום"
          value={stats.ready}
          icon="Send"
          tone="pink"
        />
        <Stat
          label="מתאימים למחזור"
          value={stats.recycle}
          icon="RefreshCw"
          tone="electric"
        />
        <Stat
          label="כפילויות מסומנות"
          value={stats.duplicates}
          icon="Copy"
          tone="orange"
        />
      </div>

      {/* ===== חיפוש וסינון ===== */}
      <Card className="animate-fade-up space-y-3.5">
        {/* חיפוש */}
        <div className="flex items-center gap-2.5 rounded-xl border border-line-strong bg-surface-2 px-3.5 py-3">
          <Icon name="Search" className="size-[18px] text-purple-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש בכל הספרייה — שם נכס, תגית או הערה..."
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

        {/* מתגים מהירים */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TOGGLES.map((t) => (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className={
                toggles[t.id]
                  ? "inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-2.5 py-1.5 text-xs font-semibold text-white shadow-glow transition-all"
                  : "inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
              }
            >
              <Icon name={t.icon} className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* סוג נכס */}
        <FilterRow label="סוג נכס">
          <FilterChip
            active={typeFilter === "all"}
            label="הכל"
            onClick={() => setTypeFilter("all")}
          />
          {TYPE_FILTERS.map((t) => (
            <FilterChip
              key={t}
              active={typeFilter === t}
              label={LIBRARY_TYPE_LABELS[t]}
              onClick={() => setTypeFilter(t)}
            />
          ))}
        </FilterRow>

        {/* פלטפורמה */}
        <FilterRow label="פלטפורמה">
          <FilterChip
            active={platformFilter === "all"}
            label="הכל"
            onClick={() => setPlatformFilter("all")}
          />
          {PLATFORM_FILTERS.map((p) => (
            <FilterChip
              key={p}
              active={platformFilter === p}
              label={PLATFORM_LABELS[p]}
              onClick={() => setPlatformFilter(p)}
            />
          ))}
        </FilterRow>

        {/* סטטוס פרסום */}
        <FilterRow label="סטטוס פרסום">
          <FilterChip
            active={statusFilter === "all"}
            label="הכל"
            onClick={() => setStatusFilter("all")}
          />
          {STATUS_FILTERS.map((s) => (
            <FilterChip
              key={s}
              active={statusFilter === s}
              label={PUBLISHED_STATUS_LABELS[s]}
              onClick={() => setStatusFilter(s)}
            />
          ))}
        </FilterRow>
      </Card>

      {/* ===== גריד הספרייה ===== */}
      <div className="animate-fade-up">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="so-section-title flex items-center gap-2">
            <Icon name="Boxes" className="size-5 text-purple-soft" />
            כספת הנכסים
          </h2>
          <span className="text-xs text-ink-mute">
            {filtered.length} מתוך {mockLibrary.length} נכסים
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="SearchX"
            title="לא נמצא נכס תואם"
            description="נסי לרכך את הסינון או לנקות את החיפוש — הספרייה גדולה, שווה לחפש שוב."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <LibraryCard
                key={item.id}
                item={item}
                projectName={projectName(item.projectId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- קומפוננטות עזר ---------- */

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line pt-3">
      <div className="mb-1.5 text-[11px] font-bold text-ink-mute">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

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

function FlagPill({
  icon,
  label,
  tone,
}: {
  icon: string;
  label: string;
  tone: "lime" | "electric" | "purple";
}) {
  const toneClass = {
    lime: "border-lime/30 bg-lime/10 text-lime",
    electric: "border-electric/30 bg-electric/10 text-electric",
    purple: "border-purple/30 bg-purple/10 text-purple-soft",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${toneClass}`}
    >
      <Icon name={icon} className="size-3" />
      {label}
    </span>
  );
}

function LibraryCard({
  item,
  projectName,
}: {
  item: ContentLibraryItem;
  projectName: string | null;
}) {
  const isPrompt = item.type === "prompt";
  const copyText = `${item.assetName}\n\n${item.notes}`;

  return (
    <Card
      interactive
      className={
        item.duplicateFlag ? "border-orange/40 bg-orange/[0.04]" : undefined
      }
    >
      {/* ראש */}
      <div className="flex items-start justify-between gap-2">
        <Badge tone="purple" icon="Layers">
          {LIBRARY_TYPE_LABELS[item.type]}
        </Badge>
        <Badge
          tone={PUBLISHED_STATUS_TONE[item.publishedStatus]}
          icon={PUBLISHED_STATUS_ICON[item.publishedStatus]}
        >
          {PUBLISHED_STATUS_LABELS[item.publishedStatus]}
        </Badge>
      </div>

      <h3 className="mt-2.5 font-display text-base font-bold leading-snug text-ink">
        {item.assetName}
      </h3>

      {/* כפילות — אזהרה */}
      {item.duplicateFlag && (
        <div className="mt-2.5 rounded-xl border border-orange/35 bg-orange/10 p-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange">
            <Icon name="AlertTriangle" className="size-3.5" />
            כפילות אפשרית — דורש אישור
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-mute">
            לא נמחק כלום אוטומטית. כדאי להשוות מול הנכס המקורי לפני החלטה.
          </p>
        </div>
      )}

      {/* מטא */}
      <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-xs">
        <MetaItem icon={SOURCE_ICON[item.source]} label="מקור">
          {SOURCE_LABELS[item.source]}
        </MetaItem>
        {item.platform && (
          <MetaItem icon="Send" label="פלטפורמה">
            {PLATFORM_LABELS[item.platform]}
            {item.contentType
              ? ` · ${CONTENT_TYPE_LABELS[item.contentType]}`
              : ""}
          </MetaItem>
        )}
        {projectName && (
          <MetaItem icon="FolderKanban" label="פרויקט">
            <span className="line-clamp-1">{projectName}</span>
          </MetaItem>
        )}
        <MetaItem icon="Clock" label="נוסף">
          {relativeTimeHe(item.createdAt)}
        </MetaItem>
      </div>

      {/* תגיות */}
      {item.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {item.tags.map((t) => (
            <Pill key={t}># {t}</Pill>
          ))}
        </div>
      )}

      {/* הכי כדאי להשתמש */}
      <div className="mt-3 rounded-xl border border-purple/25 bg-purple/5 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-purple-soft">
          <Icon name="Sparkles" className="size-3.5" />
          הכי כדאי להשתמש
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">{item.bestUse}</p>
      </div>

      {/* הערות */}
      {item.notes && item.notes !== "—" && (
        <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-ink-mute">
          <Icon name="StickyNote" className="mt-0.5 size-3.5 shrink-0" />
          {item.notes}
        </p>
      )}

      {/* דגלים + העתקה */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
        {item.readyToPublish && (
          <FlagPill icon="Send" label="מוכן לפרסום" tone="lime" />
        )}
        {item.goodForRecycle && (
          <FlagPill icon="RefreshCw" label="למחזור" tone="electric" />
        )}
        {item.goodForLecture && (
          <FlagPill icon="Presentation" label="להרצאה" tone="purple" />
        )}
        {!item.readyToPublish &&
          !item.goodForRecycle &&
          !item.goodForLecture &&
          !item.duplicateFlag && (
            <span className="text-[11px] text-ink-mute">
              נכס רפרנס — שמור בכספת.
            </span>
          )}
        {isPrompt && (
          <CopyButton text={copyText} label="העתקי פרומפט" className="ms-auto" />
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
