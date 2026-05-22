"use client";

import { useMemo, useState } from "react";
import {
  PageHeader,
  Card,
  Badge,
  Icon,
  Button,
  Pill,
  ProgressBar,
  MetaRow,
  type BadgeTone,
} from "@/components/ui";
import { AiResultView } from "@/components/shared/AiResultView";
import { useAi } from "@/components/shared/use-ai";
import { mockProjects, mockIdeas } from "@/lib/mock-data";
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/lib/constants";
import { formatDateHe, relativeTimeHe } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/lib/types";

/** גוון תווית לפי סטטוס הפרויקט. */
const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  active: "purple",
  stuck: "orange",
  review: "electric",
  done: "lime",
  planning: "mute",
};

/** אייקון לפי סוג הפרויקט. */
const TYPE_ICON: Record<string, string> = {
  lecture: "Presentation",
  "content-series": "Layers",
  client: "Briefcase",
  collaboration: "Handshake",
  product: "Package",
  "personal-brand": "Sparkles",
};

/* ---------- פעולות הפרויקט ---------- */

type LocalPanelKey = "missing" | "opportunities" | "folders" | "duplicates";

interface ProjectActionDef {
  id: string;
  label: string;
  icon: string;
  /** משימת AI — אם קיימת, נשלחת ל-/api/ai. */
  task?: string;
  /** פאנל מקומי ללא AI. */
  local?: LocalPanelKey;
}

const PROJECT_ACTIONS: ProjectActionDef[] = [
  { id: "summarize", label: "סכמי לי את הפרויקט", icon: "AlignLeft", task: "summarize-project" },
  { id: "missing", label: "מה חסר כאן?", icon: "ClipboardList", local: "missing" },
  { id: "opportunities", label: "אילו תכנים אפשר להוציא מזה?", icon: "Lightbulb", local: "opportunities" },
  { id: "folders", label: "הציעי תיקיות", icon: "FolderTree", local: "folders" },
  { id: "duplicates", label: "מצאי כפילויות", icon: "CopyCheck", local: "duplicates" },
  { id: "series", label: "הפכי לסדרת פוסטים", icon: "Rows3", task: "linkedin-post" },
  { id: "lecture", label: "הפכי להרצאה", icon: "Presentation", task: "trend-analysis" },
  { id: "carousel", label: "הפכי לקרוסלה", icon: "GalleryHorizontalEnd", task: "carousel" },
  { id: "reels", label: "הפכי לרילס", icon: "Clapperboard", task: "reels-script" },
];

export default function ProjectsPage() {
  const [selectedId, setSelectedId] = useState<string>(mockProjects[0].id);
  const [localPanel, setLocalPanel] = useState<LocalPanelKey | null>(null);
  const ai = useAi();

  const project = useMemo(
    () => mockProjects.find((p) => p.id === selectedId) ?? mockProjects[0],
    [selectedId]
  );

  /** רעיונות התוכן הקשורים לפרויקט — לפי המזהים שב-relatedIdeas. */
  const relatedIdeaItems = useMemo(
    () =>
      project.relatedIdeas
        .map((id) => mockIdeas.find((i) => i.id === id))
        .filter((i): i is NonNullable<typeof i> => Boolean(i)),
    [project]
  );

  function selectProject(id: string) {
    setSelectedId(id);
    setLocalPanel(null);
    ai.reset();
  }

  function runAction(action: ProjectActionDef) {
    if (action.local) {
      setLocalPanel((cur) => (cur === action.local ? null : action.local!));
      ai.reset();
      return;
    }
    if (!action.task) return;
    setLocalPanel(null);
    if (action.id === "carousel" || action.id === "reels") {
      ai.run(action.task, `${project.name} ${project.summary}`);
    } else {
      ai.run(action.task, project.name, project.summary);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon="FolderKanban"
        title="פרויקטים"
        subtitle="כל פרויקט במקום אחד — מה זז, מה תקוע, ומה הצעד הבא."
      >
        <Badge tone="purple" icon="FolderKanban">
          {mockProjects.length} פרויקטים פעילים
        </Badge>
      </PageHeader>

      <div className="grid animate-fade-up gap-5 lg:grid-cols-[340px_1fr]">
        {/* ===== רשימת פרויקטים ===== */}
        <div className="space-y-3">
          <h2 className="so-section-title flex items-center gap-2">
            <Icon name="List" className="size-5 text-purple-soft" />
            הפרויקטים שלך
          </h2>
          {mockProjects.map((p) => (
            <ProjectListCard
              key={p.id}
              project={p}
              active={p.id === project.id}
              onClick={() => selectProject(p.id)}
            />
          ))}
        </div>

        {/* ===== פאנל פירוט ===== */}
        <div className="space-y-5">
          <ProjectDetail
            project={project}
            relatedIdeas={relatedIdeaItems}
          />

          {/* פעולות הפרויקט */}
          <Card className="animate-fade-up">
            <div className="mb-1 flex items-center gap-2">
              <Icon name="Wand2" className="size-[18px] text-pink" />
              <h2 className="font-display text-sm font-bold text-ink">
                מה לעשות עם הפרויקט הזה
              </h2>
            </div>
            <p className="mb-3.5 flex items-center gap-1.5 text-[11px] text-ink-mute">
              <Icon name="ShieldCheck" className="size-3.5 text-lime" />
              שום קובץ לא מועבר או נמחק אוטומטית — אלה הצעות בלבד, ההחלטה שלך.
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECT_ACTIONS.map((action) => (
                <Button
                  key={action.id}
                  variant={
                    action.local
                      ? localPanel === action.local
                        ? "primary"
                        : "subtle"
                      : "ghost"
                  }
                  icon={action.icon}
                  loading={ai.loading && ai.activeTask === action.task}
                  onClick={() => runAction(action)}
                  className="!justify-start"
                >
                  {action.label}
                </Button>
              ))}
            </div>

            {/* פאנל מקומי — ללא AI */}
            {localPanel && (
              <LocalActionPanel panel={localPanel} project={project} />
            )}

            {/* שגיאת AI */}
            {ai.error && (
              <p className="mt-4 rounded-xl border border-pink/30 bg-pink/10 p-3 text-sm text-pink">
                {ai.error}
              </p>
            )}

            {/* תוצאת AI */}
            {ai.result && (
              <div className="mt-4">
                <AiResultView result={ai.result} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* קומפוננטות עזר */
/* ============================================================= */

/** כרטיס פרויקט ברשימה. */
function ProjectListCard({
  project,
  active,
  onClick,
}: {
  project: Project;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="block w-full text-right">
      <Card
        className={
          active
            ? "border-purple/50 bg-surface-2 shadow-card"
            : "transition-all hover:border-purple/40 hover:bg-surface-2"
        }
      >
        <div className="flex items-start gap-2.5">
          <div
            className={
              active
                ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow"
                : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-purple-soft"
            }
          >
            <Icon name={TYPE_ICON[project.type] ?? "Folder"} className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold leading-snug text-ink">
              {project.name}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge tone="purple">{PROJECT_TYPE_LABELS[project.type]}</Badge>
              <Badge tone={STATUS_TONE[project.status]}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <ProgressBar value={project.progress} />
          <span className="shrink-0 text-[11px] font-bold text-purple-soft">
            {project.progress}%
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-mute">
          <Icon name="CalendarClock" className="size-3.5" />
          {project.deadline ? (
            <>
              דדליין {formatDateHe(project.deadline)} ·{" "}
              <span className="font-semibold text-ink-soft">
                {relativeTimeHe(project.deadline)}
              </span>
            </>
          ) : (
            <span>פרויקט מתמשך — בלי דדליין</span>
          )}
        </div>
      </Card>
    </button>
  );
}

/** פאנל פירוט מלא של הפרויקט הנבחר. */
function ProjectDetail({
  project,
  relatedIdeas,
}: {
  project: Project;
  relatedIdeas: { id: string; title: string }[];
}) {
  return (
    <Card glow className="relative animate-fade-up overflow-hidden">
      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-purple/15 blur-3xl" />
      <div className="relative space-y-5">
        {/* כותרת */}
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="purple" icon={TYPE_ICON[project.type] ?? "Folder"}>
              {PROJECT_TYPE_LABELS[project.type]}
            </Badge>
            <Badge tone={STATUS_TONE[project.status]} icon="Circle">
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
            <Badge tone="electric" icon="Gauge">
              התקדמות {project.progress}%
            </Badge>
          </div>
          <h2 className="font-display text-xl font-bold leading-tight text-ink sm:text-2xl">
            {project.name}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {project.summary}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <ProgressBar value={project.progress} />
            <span className="shrink-0 text-xs font-bold text-purple-soft">
              {project.progress}%
            </span>
          </div>
        </div>

        {/* הצעד הבא — מודגש */}
        <div className="rounded-xl border border-orange/30 bg-orange/5 p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-orange">
            <Icon name="ArrowLeftCircle" className="size-4" />
            הצעד הבא
          </div>
          <p className="text-sm leading-relaxed text-ink">{project.nextStep}</p>
        </div>

        {/* פרטי הפרויקט */}
        <DetailSection icon="Info" title="פרטי הפרויקט">
          <div className="space-y-1.5">
            <MetaRow label="סוג">{PROJECT_TYPE_LABELS[project.type]}</MetaRow>
            <MetaRow label="סטטוס">
              {PROJECT_STATUS_LABELS[project.status]}
            </MetaRow>
            <MetaRow label="דדליין">
              {project.deadline
                ? `${formatDateHe(project.deadline)} · ${relativeTimeHe(project.deadline)}`
                : "אין דדליין — פרויקט מתמשך"}
            </MetaRow>
          </div>
        </DetailSection>

        {/* תיקיית Drive */}
        <DetailSection icon="HardDrive" title="תיקיית Drive">
          {project.relatedDriveFolder ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink-soft">
              <Icon name="Folder" className="size-4 text-electric" />
              {project.relatedDriveFolder}
            </div>
          ) : (
            <p className="text-sm text-ink-mute">
              עדיין לא חוברה תיקיית Drive לפרויקט הזה.
            </p>
          )}
        </DetailSection>

        {/* מסמכים קשורים */}
        <DetailSection icon="FileText" title="מסמכים קשורים">
          {project.relatedDocs.length ? (
            <div className="space-y-2">
              {project.relatedDocs.map((doc) => (
                <a
                  key={doc.link}
                  href={doc.link}
                  className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink-soft transition-all hover:border-purple/40 hover:text-ink"
                >
                  <Icon name="FileText" className="size-4 text-purple-soft" />
                  <span className="flex-1">{doc.name}</span>
                  <Icon name="ExternalLink" className="size-3.5 text-ink-mute" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-mute">אין מסמכים מקושרים.</p>
          )}
        </DetailSection>

        {/* מיילים קשורים */}
        <DetailSection icon="Mail" title="מיילים קשורים">
          {project.relatedEmails.length ? (
            <div className="space-y-2">
              {project.relatedEmails.map((mail) => (
                <div
                  key={mail.subject}
                  className="rounded-lg border border-line bg-surface-2 p-3"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Icon name="Mail" className="size-4 text-electric" />
                    {mail.subject}
                  </p>
                  <p className="mt-0.5 pr-6 text-[11px] text-ink-mute">
                    מאת: {mail.from}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-mute">אין מיילים מקושרים.</p>
          )}
        </DetailSection>

        {/* אירועים קשורים ביומן */}
        <DetailSection icon="CalendarDays" title="אירועים קשורים ביומן">
          {project.relatedCalendarEvents.length ? (
            <div className="space-y-2">
              {project.relatedCalendarEvents.map((ev) => (
                <div
                  key={ev.title}
                  className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2"
                >
                  <Icon name="CalendarDays" className="size-4 text-pink" />
                  <span className="flex-1 text-sm text-ink-soft">{ev.title}</span>
                  <span className="text-[11px] font-semibold text-ink-mute">
                    {formatDateHe(ev.date)} · {relativeTimeHe(ev.date)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-mute">אין אירועים מקושרים ביומן.</p>
          )}
        </DetailSection>

        {/* רעיונות תוכן קשורים */}
        <DetailSection icon="Lightbulb" title="רעיונות תוכן קשורים">
          {relatedIdeas.length ? (
            <div className="space-y-2">
              {relatedIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2"
                >
                  <Icon name="Lightbulb" className="size-4 text-orange" />
                  <span className="text-sm text-ink-soft">{idea.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-mute">
              אין עדיין רעיונות תוכן מקושרים לפרויקט.
            </p>
          )}
        </DetailSection>

        {/* מה חסר */}
        <DetailSection icon="ClipboardList" title="מה חסר">
          {project.missingItems.length ? (
            <div className="flex flex-wrap gap-1.5">
              {project.missingItems.map((item) => (
                <Pill key={item}>
                  <Icon name="Circle" className="size-2.5 text-orange" />
                  {item}
                </Pill>
              ))}
            </div>
          ) : (
            <Badge tone="lime" icon="Check">
              לא חסר כלום — הפרויקט מלא
            </Badge>
          )}
        </DetailSection>

        {/* הזדמנויות תוכן */}
        <DetailSection icon="Sparkles" title="הזדמנויות תוכן מהפרויקט">
          {project.contentOpportunities.length ? (
            <ul className="space-y-2">
              {project.contentOpportunities.map((opp) => (
                <li
                  key={opp}
                  className="flex items-start gap-2.5 rounded-lg border border-purple/20 bg-purple/5 px-3 py-2"
                >
                  <Icon
                    name="Sparkles"
                    className="mt-0.5 size-4 shrink-0 text-purple-soft"
                  />
                  <span className="text-sm text-ink-soft">{opp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-mute">
              עוד לא זוהו הזדמנויות תוכן — אפשר לבקש הצעות מ-SHELLY OG למטה.
            </p>
          )}
        </DetailSection>
      </div>
    </Card>
  );
}

/** מקטע פירוט עם כותרת ואייקון. */
function DetailSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line pt-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon name={icon} className="size-4 text-ink-mute" />
        <h3 className="text-xs font-bold uppercase tracking-wide text-ink-mute">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

/** פאנל פעולה מקומי — בלי AI. */
function LocalActionPanel({
  panel,
  project,
}: {
  panel: LocalPanelKey;
  project: Project;
}) {
  if (panel === "missing") {
    return (
      <PanelShell icon="ClipboardList" title="מה חסר כדי לקדם את הפרויקט">
        {project.missingItems.length ? (
          <ul className="space-y-2">
            {project.missingItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 rounded-lg border border-orange/25 bg-orange/5 px-3 py-2"
              >
                <Icon name="AlertCircle" className="size-4 shrink-0 text-orange" />
                <span className="text-sm text-ink-soft">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-lime">
            לא חסר כלום — הפרויקט הזה מוכן להמשיך הלאה.
          </p>
        )}
        <p className="mt-3 text-[11px] text-ink-mute">
          התחילי מהפריט הראשון — הוא בדרך כלל מה שחוסם את כל השאר.
        </p>
      </PanelShell>
    );
  }

  if (panel === "opportunities") {
    return (
      <PanelShell icon="Lightbulb" title="תכנים שאפשר להוציא מהפרויקט">
        {project.contentOpportunities.length ? (
          <ul className="space-y-2">
            {project.contentOpportunities.map((opp) => (
              <li
                key={opp}
                className="flex items-start gap-2.5 rounded-lg border border-purple/25 bg-purple/5 px-3 py-2"
              >
                <Icon
                  name="Sparkles"
                  className="mt-0.5 size-4 shrink-0 text-purple-soft"
                />
                <span className="text-sm text-ink-soft">{opp}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-mute">
            לפרויקט הזה אין עדיין הזדמנויות תוכן מוגדרות. נסי "הפכי לקרוסלה" או
            "הפכי לסדרת פוסטים" כדי שאייצר לך כיוונים.
          </p>
        )}
        <p className="mt-3 text-[11px] text-ink-mute">
          כל פרויקט הוא מכרה תוכן — פרויקט אחד טוב שווה חודש פרסום.
        </p>
      </PanelShell>
    );
  }

  if (panel === "folders") {
    return (
      <PanelShell icon="FolderTree" title="הצעת מבנה תיקיות לפרויקט">
        <p className="mb-2 text-sm text-ink-soft">
          ככה הייתי מסדרת את החומרים של הפרויקט הזה ב-Drive:
        </p>
        <ul className="space-y-1.5 text-sm text-ink-soft">
          {[
            "01 · בריף ואסטרטגיה",
            "02 · טיוטות ומסמכי עבודה",
            "03 · נכסים ויזואליים",
            "04 · גרסאות סופיות לפרסום",
            "05 · ארכיון וגרסאות ישנות",
          ].map((folder) => (
            <li
              key={folder}
              className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2"
            >
              <Icon name="Folder" className="size-4 text-electric" />
              {folder}
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-mute">
          <Icon name="ShieldCheck" className="size-3.5 text-lime" />
          זו הצעה בלבד — שום תיקייה לא נוצרת או משתנה אוטומטית.
        </p>
      </PanelShell>
    );
  }

  return (
    <PanelShell icon="CopyCheck" title="בדיקת כפילויות">
      <p className="text-sm text-ink-soft">
        עברתי על החומרים של "{project.name}" ולא זיהיתי כפילויות ברורות בין
        המסמכים, המיילים והרעיונות המקושרים. כשיתחברו נתונים אמיתיים מ-Drive
        ו-Gmail, אסמן כאן קבצים חשודים ככפילות — ותמיד תצטרכי לאשר לפני מחיקה.
      </p>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-mute">
        <Icon name="ShieldCheck" className="size-3.5 text-lime" />
        שום קובץ לא נמחק אוטומטית — רק סימון לבדיקה.
      </p>
    </PanelShell>
  );
}

/** מעטפת פאנל מקומי. */
function PanelShell({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 animate-fade-up rounded-2xl border border-line bg-surface-2/70 p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-purple-soft">
          <Icon name={icon} className="size-4" />
        </span>
        <span className="text-sm font-bold text-ink">{title}</span>
      </div>
      {children}
    </div>
  );
}
