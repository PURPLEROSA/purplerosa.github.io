"use client";

import { useEffect, useState } from "react";
import {
  PageHeader,
  Card,
  CardTitle,
  Badge,
  Icon,
  Button,
  Pill,
} from "@/components/ui";
import { SOURCE_ICON } from "@/lib/constants";
import type { ItemSource, ToneProfile } from "@/lib/types";
import { useToneProfile } from "@/components/shared/use-tone";

/* =============================================================
 * SHELLY OG — הגדרות
 * חיבורים, מצב נתונים, מנוע AI, כללי בטיחות, מארגן Drive
 * ומזהה הזדמנויות במייל. כל פעולה אמיתית דורשת אישור מפורש.
 * ============================================================= */

/* ---------- חיבורי Google ---------- */
const GOOGLE_INTEGRATIONS: {
  source: ItemSource;
  name: string;
  description: string;
}[] = [
  {
    source: "gmail",
    name: "Gmail",
    description: "קריאת ניוזלטרים, זיהוי הזדמנויות, ניסוח טיוטות.",
  },
  {
    source: "drive",
    name: "Google Drive",
    description: "מיפוי קבצים, זיהוי כפילויות, הצעת מבנה תיקיות.",
  },
  {
    source: "docs",
    name: "Google Docs",
    description: "חילוץ רעיונות וחומרי הרצאה ממסמכים.",
  },
  {
    source: "sheets",
    name: "Google Sheets",
    description: "סנכרון מאגרי רעיונות, פרומפטים ותכנון.",
  },
  {
    source: "calendar",
    name: "Google Calendar",
    description: "קריאת אירועים, דדליינים וחלונות פרסום.",
  },
];

/* ---------- יכולות מארגן ה-Drive ---------- */
const ORGANIZER_CAPABILITIES: { icon: string; text: string }[] = [
  { icon: "FolderTree", text: "להציע מבנה תיקיות נקי והגיוני" },
  { icon: "Tags", text: "לתייג קבצים לפי נושא ופרויקט" },
  { icon: "FileText", text: "לסכם תיקיות שלמות במשפט אחד" },
  { icon: "Copy", text: "לאתר קבצים כפולים או חופפים" },
  { icon: "Sparkles", text: "לזהות קבצים ששווה להפוך לתוכן" },
  { icon: "History", text: "לאתר קבצים ישנים ששווה לרענן" },
  { icon: "Archive", text: "להמליץ מה לארכב ומה למחוק" },
];

/* ---------- יכולות מזהה ההזדמנויות במייל ---------- */
const OPPORTUNITY_TYPES: { icon: string; text: string }[] = [
  { icon: "Presentation", text: "הזמנות להרצאות" },
  { icon: "Handshake", text: "הצעות לשיתופי פעולה" },
  { icon: "Briefcase", text: "הצעות עבודה" },
  { icon: "UserPlus", text: "פניות מלקוחות" },
  { icon: "Receipt", text: "בקשות להצעות מחיר" },
  { icon: "Cpu", text: "עדכוני כלי AI" },
  { icon: "Mail", text: "ניוזלטרים חשובים" },
  { icon: "ListChecks", text: "משימות ופולואפים" },
];

const OPPORTUNITY_ACTIONS: { icon: string; text: string }[] = [
  { icon: "PenLine", text: "ניסוח טיוטת מענה" },
  { icon: "Sparkles", text: "הפיכה לרעיון לתוכן" },
  { icon: "FolderKanban", text: "שמירה לפרויקט מתאים" },
  { icon: "BellRing", text: "יצירת תזכורת מעקב" },
];

/* ============================================================= */

export default function SettingsPage() {
  /* מתגים דקורטיביים — מצב הדגמה בלבד */
  const [liveMode, setLiveMode] = useState(false);
  const [scanFrequency, setScanFrequency] = useState<"daily" | "manual">(
    "daily"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon="Settings"
        title="הגדרות"
        subtitle="חיבורים, מצב נתונים וכללי הבטיחות של SHELLY OG."
      />

      {/* ===== הטון שלי ===== */}
      <ToneSection />

      {/* ===== חיבורי Google ===== */}
      <Card className="animate-fade-up">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="Plug" className="size-[18px] text-purple-soft" />
          <CardTitle>חיבורי Google</CardTitle>
        </div>
        <p className="mb-4 text-sm text-ink-soft">
          חמשת המקורות שמזינים את SHELLY OG. כרגע כולם רצים על נתוני הדגמה
          בטוחים — לא נקראת אף תיבת מייל ולא נגעת באף קובץ אמיתי.
        </p>

        <div className="space-y-2.5">
          {GOOGLE_INTEGRATIONS.map((integration) => (
            <div
              key={integration.source}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2 p-3"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-purple-soft">
                <Icon
                  name={SOURCE_ICON[integration.source]}
                  className="size-5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">
                  {integration.name}
                </p>
                <p className="text-xs text-ink-mute">
                  {integration.description}
                </p>
              </div>
              <Badge tone="lime" icon="ShieldCheck">
                מצב הדגמה (Mock)
              </Badge>
              <Button variant="ghost" size="sm" icon="Link2">
                חברי
              </Button>
            </div>
          ))}
        </div>

        {/* כפתור חיבור Google אמיתי */}
        <div className="mt-4 flex flex-col items-start gap-2.5 rounded-xl border border-purple/25 bg-purple/5 p-3.5">
          <a
            href="/api/google/auth"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:opacity-90"
          >
            <Icon name="Plug" className="size-4" />
            התחברי ל-Google
          </a>
          <p className="text-xs leading-relaxed text-ink-soft">
            הכפתור פותח את מסך ההסכמה של Google. בסיום תקבלי{" "}
            <span className="font-semibold text-ink">refresh token</span> —
            הוסיפי אותו ב-Vercel כמשתנה הסביבה{" "}
            <span className="rounded bg-white/5 px-1 font-mono text-[11px] text-ink">
              GOOGLE_REFRESH_TOKEN
            </span>{" "}
            ועשי Redeploy. החיבור עובד רק אחרי שמשתני הסביבה של Google מוגדרים
            ב-Vercel.
          </p>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-electric/25 bg-electric/5 p-3">
          <Icon
            name="Info"
            className="mt-0.5 size-4 shrink-0 text-electric"
          />
          <p className="text-xs leading-relaxed text-ink-soft">
            חיבור אמיתי דורש הזנת הרשאות Google OAuth (
            <span className="font-semibold text-ink">
              GOOGLE_CLIENT_ID / SECRET / REFRESH_TOKEN
            </span>
            ) כמשתני סביבה (ב-Vercel או בקובץ{" "}
            <span className="rounded bg-white/5 px-1 font-mono text-[11px] text-ink">
              .env.local
            </span>
            ) — ראי את ה-README. עד שתחברי, האפליקציה רצה על נתוני הדגמה בטוחים
            ומלאים, כך שאפשר לסקור את כל המוצר כבר עכשיו.
          </p>
        </div>
      </Card>

      {/* ===== מצב נתונים ===== */}
      <Card className="animate-fade-up">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="Database" className="size-[18px] text-purple-soft" />
          <CardTitle>מצב נתונים</CardTitle>
        </div>
        <p className="mb-4 text-sm text-ink-soft">
          SHELLY OG פועלת כעת ב<span className="font-semibold text-ink">מצב הדגמה</span> —
          כל הנתונים מדומים ובטוחים. מצב חי ייפתח אוטומטית כשתוזן הרשאת Google
          תקפה.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <ModeOption
            active={!liveMode}
            locked={false}
            icon="FlaskConical"
            tone="lime"
            title="מצב הדגמה"
            description="נתונים מדומים, מלאים ובטוחים. מושלם לסקירה ולהדגמה."
            badge="פעיל עכשיו"
            onClick={() => setLiveMode(false)}
          />
          <ModeOption
            active={liveMode}
            locked
            icon="Wifi"
            tone="electric"
            title="מצב חי"
            description="נתונים אמיתיים מ-Google Workspace. דורש הרשאות ב-.env.local."
            badge="נעול — חסרות הרשאות"
            onClick={() => {
              /* נעול עד שיוזנו הרשאות */
            }}
          />
        </div>
      </Card>

      {/* ===== מנוע AI ===== */}
      <Card className="animate-fade-up">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="BrainCircuit" className="size-[18px] text-purple-soft" />
          <CardTitle>מנוע ה-AI</CardTitle>
        </div>
        <p className="mb-4 text-sm text-ink-soft">
          המנוע שמפעיל את הניסוח, הזוויות והניתוחים בכל המוצר.
        </p>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Icon name="Sparkles" className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">מנוע Mock פעיל</p>
            <p className="text-xs text-ink-mute">
              מייצר תוצרים איכותיים ועקביים בלי מפתח חיצוני — מצוין להדגמה.
            </p>
          </div>
          <Badge tone="lime" icon="Check">
            מחובר
          </Badge>
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-electric/25 bg-electric/5 p-3">
          <Icon name="Key" className="mt-0.5 size-4 shrink-0 text-electric" />
          <p className="text-xs leading-relaxed text-ink-soft">
            לחיבור מנוע אמיתי (Anthropic או OpenAI) הוסיפי מפתח API בקובץ{" "}
            <span className="rounded bg-white/5 px-1 font-mono text-[11px] text-ink">
              .env.local
            </span>{" "}
            — והמערכת תעבור אוטומטית לתוצרים חיים, באותו ממשק בדיוק.
          </p>
        </div>
      </Card>

      {/* ===== כללי בטיחות ===== */}
      <Card
        glow
        className="relative animate-fade-up overflow-hidden border-lime/25"
      >
        <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-lime/10 blur-3xl" />
        <div className="relative">
          <div className="mb-1 flex items-center gap-2">
            <Icon name="ShieldCheck" className="size-[18px] text-lime" />
            <CardTitle>כללי בטיחות</CardTitle>
          </div>
          <p className="mb-4 text-sm text-ink-soft">
            SHELLY OG מנסחת, ממליצה, מארגנת ומכינה — אבל לעולם לא פועלת לבד.
            כל פעולה אמיתית עוברת דרכך. הנה ההבטחה המלאה:
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <GuardrailRow
              icon="Send"
              text="לעולם לא מפרסמת תוכן באופן אוטומטי"
            />
            <GuardrailRow
              icon="MailX"
              text="לעולם לא שולחת מיילים באופן אוטומטי"
            />
            <GuardrailRow
              icon="FolderX"
              text="לעולם לא מזיזה או מוחקת קבצים באופן אוטומטי"
            />
            <GuardrailRow
              icon="CalendarX"
              text="לעולם לא משנה אירועים ביומן באופן אוטומטי"
            />
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-lime/25 bg-lime/5 p-3.5">
            <Icon
              name="Lock"
              className="mt-0.5 size-4 shrink-0 text-lime"
            />
            <p className="text-sm leading-relaxed text-ink-soft">
              <span className="font-bold text-lime">השליטה תמיד אצלך.</span>{" "}
              המערכת מכינה טיוטות, המלצות וסידור — אבל כל פעולה שמשנה משהו
              בעולם האמיתי דורשת אישור מפורש שלך. בלי הפתעות.
            </p>
          </div>
        </div>
      </Card>

      {/* ===== מארגן ה-Drive ===== */}
      <Card className="animate-fade-up">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="HardDrive" className="size-[18px] text-purple-soft" />
          <CardTitle>מארגן ה-Drive</CardTitle>
        </div>
        <p className="mb-4 text-sm text-ink-soft">
          מארגן ה-Drive עושה סדר בכאוס — בלי לגעת בשום קובץ לפני שאישרת.
        </p>

        {/* יכולות */}
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {ORGANIZER_CAPABILITIES.map((cap) => (
            <div
              key={cap.text}
              className="flex items-center gap-2.5 rounded-lg bg-surface-2 px-3 py-2"
            >
              <Icon
                name={cap.icon}
                className="size-4 shrink-0 text-purple-soft"
              />
              <span className="text-sm text-ink-soft">{cap.text}</span>
            </div>
          ))}
        </div>

        {/* הצעות לדוגמה */}
        <div className="mb-2 flex items-center gap-1.5">
          <Icon name="Lightbulb" className="size-4 text-orange" />
          <h3 className="font-display text-sm font-bold text-ink">
            הצעות לדוגמה
          </h3>
        </div>
        <div className="space-y-2.5">
          {/* מבנה תיקיות מוצע */}
          <SuggestionCard
            icon="FolderTree"
            tone="purple"
            title="מבנה תיקיות מוצע"
          >
            <ul className="space-y-1.5">
              {[
                "הרצאות — כל חומרי ההרצאות במקום אחד",
                "סדרות תוכן — תיקייה לכל סדרה, לעקביות הפקה",
                "נכסים פעילים — פרומפטים, הוקים ותבניות בשימוש",
                "ארכיון למחזור — תוכן ישן בעל ערך שמחכה לרענון",
              ].map((folder) => (
                <li
                  key={folder}
                  className="flex items-center gap-2 text-sm text-ink-soft"
                >
                  <Icon
                    name="Folder"
                    className="size-3.5 shrink-0 text-purple-soft"
                  />
                  {folder}
                </li>
              ))}
            </ul>
          </SuggestionCard>

          {/* כפילות שזוהתה */}
          <SuggestionCard
            icon="Copy"
            tone="orange"
            title="כפילות אפשרית שזוהתה"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
              <Pill>מאגר הוקים.docx</Pill>
              <Icon name="ArrowLeftRight" className="size-3.5 text-ink-mute" />
              <Pill>מאגר הוקים — עותק.docx</Pill>
              <Badge tone="orange">93% התאמה</Badge>
            </div>
            <p className="mt-1.5 text-xs text-ink-mute">
              שני קבצים כמעט זהים. ההמלצה: למחוק את העותק הישן ולשמור אחד.
            </p>
          </SuggestionCard>

          {/* קובץ ישן שכדאי למחזר */}
          <SuggestionCard
            icon="History"
            tone="electric"
            title="קובץ ישן ששווה למחזר לתוכן"
          >
            <p className="text-sm text-ink-soft">
              <span className="font-semibold text-ink">
                הקלטת וובינר אוטומציה 2025.mp4
              </span>{" "}
              — תוכן מצוין שכמעט לא נצפה. אפשר לחתוך אותו ל-4 קרוסלות
              ופוסט סמכות אחד. מאמץ נמוך, תשואה גבוהה.
            </p>
          </SuggestionCard>
        </div>
      </Card>

      {/* ===== מזהה ההזדמנויות במייל ===== */}
      <Card className="animate-fade-up">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="MailSearch" className="size-[18px] text-purple-soft" />
          <CardTitle>מזהה ההזדמנויות במייל</CardTitle>
        </div>
        <p className="mb-4 text-sm text-ink-soft">
          סורק את ה-Gmail שלך ומאתר את מה שחשוב באמת — בלי שתצטרכי לפתוח
          כל מייל בעצמך.
        </p>

        {/* מה הוא מזהה */}
        <div className="mb-2 flex items-center gap-1.5">
          <Icon name="ScanSearch" className="size-4 text-electric" />
          <h3 className="font-display text-sm font-bold text-ink">
            מה הוא מזהה
          </h3>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {OPPORTUNITY_TYPES.map((type) => (
            <span
              key={type.text}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-ink-soft"
            >
              <Icon name={type.icon} className="size-3.5 text-electric" />
              {type.text}
            </span>
          ))}
        </div>

        {/* פעולה לכל הזדמנות */}
        <div className="mb-2 flex items-center gap-1.5">
          <Icon name="Wand2" className="size-4 text-orange" />
          <h3 className="font-display text-sm font-bold text-ink">
            ולכל הזדמנות — הוא מציע פעולה
          </h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {OPPORTUNITY_ACTIONS.map((action) => (
            <div
              key={action.text}
              className="flex items-center gap-2.5 rounded-lg bg-surface-2 px-3 py-2"
            >
              <Icon
                name={action.icon}
                className="size-4 shrink-0 text-orange"
              />
              <span className="text-sm text-ink-soft">{action.text}</span>
            </div>
          ))}
        </div>

        {/* בקרת תדירות סריקה — דקורטיבי */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2 p-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-ink-mute">
            <Icon name="Clock" className="size-3.5" />
            תדירות סריקה:
          </span>
          <FrequencyChip
            active={scanFrequency === "daily"}
            label="יומית"
            onClick={() => setScanFrequency("daily")}
          />
          <FrequencyChip
            active={scanFrequency === "manual"}
            label="ידנית בלבד"
            onClick={() => setScanFrequency("manual")}
          />
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-lime/25 bg-lime/5 p-3">
          <Icon
            name="ShieldCheck"
            className="mt-0.5 size-4 shrink-0 text-lime"
          />
          <p className="text-xs leading-relaxed text-ink-soft">
            <span className="font-bold text-lime">בטוח לחלוטין.</span> המזהה
            יוצר טיוטות מענה רק לאחר אישור מפורש שלך — ולעולם לא שולח מייל
            בשמך. הוא עוזר לך להגיב מהר, אבל המקלדת נשארת אצלך.
          </p>
        </div>
      </Card>

      {/* הערת עקרון */}
      <div className="animate-fade-up rounded-2xl border border-line bg-surface-2/50 p-4 text-center text-sm text-ink-mute">
        SHELLY OG בנויה על עיקרון אחד: עוזרת חכמה שאת תמיד שולטת בה. היא
        מכינה את הכל — ההחלטה תמיד שלך.
      </div>
    </div>
  );
}

/* ============================================================= */
/* ---------- הטון שלי ---------- */

/** ממיר מערך לטקסט רב-שורתי (פריט לכל שורה). */
function linesFromArray(items: string[]): string {
  return items.join("\n");
}

/** ממיר טקסט רב-שורתי למערך, מסנן שורות ריקות. */
function arrayFromLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function ToneSection() {
  const { tone, save, reset } = useToneProfile();

  const [draft, setDraft] = useState<ToneProfile>(tone);
  const [saved, setSaved] = useState(false);

  /* סנכרון הטיוטה כשהטון נטען מה-localStorage */
  useEffect(() => {
    setDraft(tone);
  }, [tone]);

  function setField<K extends keyof ToneProfile>(
    key: K,
    value: ToneProfile[K]
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    save({
      ...draft,
      traits: arrayFromLines(linesFromArray(draft.traits)),
      dos: arrayFromLines(linesFromArray(draft.dos)),
      donts: arrayFromLines(linesFromArray(draft.donts)),
      signaturePhrases: arrayFromLines(linesFromArray(draft.signaturePhrases)),
    });
    setSaved(true);
  }

  function handleReset() {
    reset();
    setSaved(false);
  }

  return (
    <Card
      glow
      className="relative animate-fade-up overflow-hidden border-purple/25"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-purple/10 blur-3xl" />
      <div className="relative">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="AudioLines" className="size-[18px] text-purple-soft" />
          <CardTitle>הטון שלי</CardTitle>
        </div>
        <p className="mb-4 text-sm text-ink-soft">
          זה הקול ש-SHELLY OG משתמשת בו בכל פוסט, תסריט ושכתוב שהיא כותבת לך.
          ככל שתדייקי אותו יותר — כך התוצרים יישמעו יותר כמוך, ופחות כמו AI
          גנרי. שווה להשקיע בזה כמה דקות.
        </p>

        {/* שדות שורה אחת */}
        <div className="grid gap-3 sm:grid-cols-2">
          <ToneInput
            label="משפט הקול"
            hint="משפט אחד שמתאר איך את נשמעת."
            value={draft.summary}
            onChange={(v) => setField("summary", v)}
          />
          <ToneInput
            label="קהל היעד"
            hint="למי את מדברת."
            value={draft.audience}
            onChange={(v) => setField("audience", v)}
          />
          <ToneInput
            label="מדיניות אימוג'ים"
            hint="מתי וכמה להשתמש."
            value={draft.emoji}
            onChange={(v) => setField("emoji", v)}
          />
          <ToneInput
            label="חתימה אופיינית"
            hint="איך את סוגרת פוסט."
            value={draft.signoff}
            onChange={(v) => setField("signoff", v)}
          />
        </div>

        {/* שדות רב-שורתיים — פריט לכל שורה */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ToneList
            label="תכונות הקול"
            hint="תכונה אחת בכל שורה."
            value={draft.traits}
            onChange={(v) => setField("traits", v)}
          />
          <ToneList
            label="ביטויים אופייניים"
            hint="ביטוי אחד בכל שורה."
            value={draft.signaturePhrases}
            onChange={(v) => setField("signaturePhrases", v)}
          />
          <ToneList
            label="כן לעשות"
            hint="הנחיה אחת בכל שורה."
            value={draft.dos}
            onChange={(v) => setField("dos", v)}
          />
          <ToneList
            label="לא לעשות"
            hint="הנחיה אחת בכל שורה."
            value={draft.donts}
            onChange={(v) => setField("donts", v)}
          />
        </div>

        {/* פעולות */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Button variant="primary" icon="Check" onClick={handleSave}>
            שמרי את הטון
          </Button>
          <Button variant="ghost" icon="RotateCcw" onClick={handleReset}>
            אפסי לברירת מחדל
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime">
              <Icon name="CheckCircle2" className="size-4" />
              הטון נשמר ✓
            </span>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-purple/25 bg-purple/5 p-3">
          <Icon
            name="Info"
            className="mt-0.5 size-4 shrink-0 text-purple-soft"
          />
          <p className="text-xs leading-relaxed text-ink-soft">
            הטון נשמר אצלך בדפדפן (localStorage) ומוזן אוטומטית בכל המוצר —
            הסטודיו, חדשות הבוקר וכלי השכתוב — כך שכל תוצר חדש נכתב בקול שלך.
          </p>
        </div>
      </div>
    </Card>
  );
}

function ToneInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline gap-1.5">
        <span className="text-xs font-bold text-ink">{label}</span>
        <span className="text-[11px] text-ink-mute">{hint}</span>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-purple/50"
      />
    </label>
  );
}

function ToneList({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline gap-1.5">
        <span className="text-xs font-bold text-ink">{label}</span>
        <span className="text-[11px] text-ink-mute">{hint}</span>
      </span>
      <textarea
        rows={5}
        value={linesFromArray(value)}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className="w-full resize-y rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-purple/50"
      />
    </label>
  );
}

/* ============================================================= */
/* ---------- קומפוננטות עזר ---------- */

function ModeOption({
  active,
  locked,
  icon,
  tone,
  title,
  description,
  badge,
  onClick,
}: {
  active: boolean;
  locked: boolean;
  icon: string;
  tone: "lime" | "electric";
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
}) {
  const toneText = tone === "lime" ? "text-lime" : "text-electric";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={
        active
          ? "flex items-start gap-3 rounded-xl border border-purple/40 bg-purple/5 p-3.5 text-right shadow-card transition-all"
          : locked
            ? "flex cursor-not-allowed items-start gap-3 rounded-xl border border-line bg-surface-2/60 p-3.5 text-right opacity-70"
            : "flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-3.5 text-right transition-all hover:border-purple/50"
      }
    >
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${toneText}`}
      >
        <Icon name={locked ? "Lock" : icon} className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-ink">{title}</span>
          {active && (
            <Icon name="CheckCircle2" className="size-4 text-purple-soft" />
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-mute">
          {description}
        </p>
        <span
          className={`mt-1.5 inline-block text-[11px] font-semibold ${
            locked ? "text-ink-mute" : toneText
          }`}
        >
          {badge}
        </span>
      </div>
    </button>
  );
}

function GuardrailRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-lime/10 text-lime">
        <Icon name={icon} className="size-4" />
      </div>
      <span className="text-sm font-medium text-ink-soft">{text}</span>
      <Icon name="Check" className="ms-auto size-4 shrink-0 text-lime" />
    </div>
  );
}

function SuggestionCard({
  icon,
  tone,
  title,
  children,
}: {
  icon: string;
  tone: "purple" | "orange" | "electric";
  title: string;
  children: React.ReactNode;
}) {
  const toneText = {
    purple: "text-purple-soft",
    orange: "text-orange",
    electric: "text-electric",
  }[tone];
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className={`flex items-center gap-1.5 text-xs font-bold ${toneText}`}>
          <Icon name={icon} className="size-3.5" />
          {title}
        </div>
        <Badge tone="mute" icon="Lock">
          דורש אישור
        </Badge>
      </div>
      {children}
    </div>
  );
}

function FrequencyChip({
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
          ? "rounded-lg bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow-glow transition-all"
          : "rounded-lg border border-line-strong bg-surface-2 px-3 py-1 text-xs font-medium text-ink-soft transition-all hover:border-purple/50 hover:text-ink"
      }
    >
      {label}
    </button>
  );
}
