"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader, SectionHeading } from "@/components/ui";
import { ManagerNote } from "@/components/ManagerNote";
import { GmailScanDialog } from "@/components/GmailScanDialog";
import { Icon } from "@/components/icons";
import { GOOGLE_SCOPES } from "@/lib/googleAuth";
import { SHEET_TABS } from "@/lib/sheetsSchema";
import { createSpreadsheetSchema, type SchemaResult } from "@/lib/sheetsService";

const SCOPE_INFO: Record<string, string> = {
  "https://www.googleapis.com/auth/gmail.readonly":
    "קריאת מיילים — כדי לזהות פניות והזדמנויות. קריאה בלבד.",
  "https://www.googleapis.com/auth/gmail.compose":
    "יצירת טיוטות מייל בלבד. המערכת לא יכולה לשלוח.",
  "https://www.googleapis.com/auth/spreadsheets":
    "שמירה וקריאה של ההזדמנויות, המחירים והסטטוסים ב-Google Sheets.",
  "https://www.googleapis.com/auth/calendar.events":
    "יצירת תזכורות פולואפ ביומן — רק אחרי אישור שלך.",
  "https://www.googleapis.com/auth/userinfo.email":
    "זיהוי כתובת החשבון המחובר.",
};

export default function SetupPage() {
  const { connection, toast } = useStore();
  const [scanOpen, setScanOpen] = useState(false);
  const [schema, setSchema] = useState<SchemaResult | null>(null);

  const buildSchema = async () => {
    const result = await createSpreadsheetSchema();
    setSchema(result);
    toast(result.message, "success");
  };

  const services = [
    {
      name: "Gmail",
      icon: "mail",
      connected: connection.gmail,
      desc: "זיהוי פניות נכנסות ויצירת טיוטות.",
    },
    {
      name: "Google Sheets",
      icon: "dashboard",
      connected: connection.sheets,
      desc: "מסד הנתונים של ההזדמנויות והמחירים.",
    },
    {
      name: "Google Calendar",
      icon: "calendar",
      connected: connection.calendar,
      desc: "תזכורות פולואפ פרטיות.",
    },
    {
      name: "מנוע AI",
      icon: "sparkles",
      connected: connection.ai,
      desc: "סיווג מיילים והצעות חכמות.",
    },
  ];

  return (
    <div>
      <PageHeader
        title="חיבור Google"
        subtitle="המערכת עובדת מצוין במצב דמו. מתחברים ל-Google כשמוכנים."
      />

      <div className="mb-6">
        <ManagerNote>
          את לא חייבת להתחבר לשום דבר כדי להתחיל. המערכת רצה עכשיו על נתוני דמו —
          כל המסכים, הכפתורים וההיגיון עובדים. כשתרצי לחבר חשבון אמיתי, השלבים
          כאן למטה. בלי לחץ.
        </ManagerNote>
      </div>

      {/* Connection status */}
      <section className="mb-8">
        <SectionHeading title="סטטוס חיבורים" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.name} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-raised text-slate-300">
                  <Icon name={s.icon} className="h-4 w-4" />
                </span>
                <span
                  className={`chip ${
                    s.connected
                      ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                      : "border-accent-amber/40 bg-accent-amber/10 text-accent-amber"
                  }`}
                >
                  {s.connected ? "מחובר" : "מצב דמו"}
                </span>
              </div>
              <p className="mt-2 font-bold text-slate-100">{s.name}</p>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mb-8">
        <SectionHeading title="שלבי החיבור" />
        <div className="card divide-y divide-ink-border">
          <Step
            n={1}
            title="חיבור חשבון Google"
            text="מתחברים פעם אחת ומאשרים את ההרשאות. אפשר לנתק בכל רגע."
            action={
              <button
                onClick={() =>
                  toast(
                    "במצב דמו אין צורך להתחבר. להתחברות אמיתית — ראי את ההוראות ב-README.",
                    "info",
                  )
                }
                className="btn-primary text-xs"
              >
                <Icon name="plug" className="h-3.5 w-3.5" />
                חיבור חשבון
              </button>
            }
          />
          <Step
            n={2}
            title="בחירת או יצירת Google Sheet"
            text="המערכת תיצור 6 טאבים מסודרים שישמשו כמסד הנתונים."
            action={
              <button onClick={buildSchema} className="btn-ghost text-xs">
                <Icon name="dashboard" className="h-3.5 w-3.5" />
                בניית מבנה הגיליון
              </button>
            }
          />
          <Step
            n={3}
            title="בדיקת גישה ל-Gmail"
            text="סריקת דמו שמראה איך המערכת מזהה הזדמנויות מתוך מיילים."
            action={
              <button
                onClick={() => setScanOpen(true)}
                className="btn-ghost text-xs"
              >
                <Icon name="mail" className="h-3.5 w-3.5" />
                בדיקת סריקה
              </button>
            }
          />
          <Step
            n={4}
            title="בדיקת גישה ל-Calendar"
            text="תזכורות נוצרות רק אחרי אישור, והן פרטיות — הלקוח לא מוזמן."
          />
          <Step
            n={5}
            title="מצב דמו"
            text="פעיל עכשיו. כל עוד לא מתחברים — שום נתון לא יוצא מהמכשיר."
            done
          />
        </div>
      </section>

      {/* Schema result */}
      {schema && (
        <section className="mb-8">
          <SectionHeading title="מבנה Google Sheets" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {schema.tabs.map((t) => (
              <div key={t.name} className="card p-3">
                <p className="font-bold text-slate-100">{t.name}</p>
                <p className="text-xs text-slate-400">
                  {t.columns} עמודות
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">{schema.message}</p>
        </section>
      )}

      {/* Schema reference */}
      <section className="mb-8">
        <SectionHeading title="הטאבים שייווצרו" />
        <div className="space-y-2">
          {SHEET_TABS.map((t) => (
            <div
              key={t.name}
              className="flex items-center gap-3 rounded-xl border border-ink-border bg-ink-soft/60 p-3"
            >
              <Icon name="dashboard" className="h-4 w-4 text-brand-pink" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-100">
                  {t.name}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {t.description}
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {t.columns.length} עמודות
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Scopes */}
      <section>
        <SectionHeading title="ההרשאות שיתבקשו" />
        <p className="mb-3 text-sm text-slate-400">
          המערכת מבקשת את ההרשאות המצומצמות ביותר שמאפשרות לה לעבוד.
        </p>
        <div className="space-y-2">
          {GOOGLE_SCOPES.map((scope) => (
            <div
              key={scope}
              className="flex items-start gap-2 rounded-xl border border-ink-border bg-ink-soft/60 p-3"
            >
              <Icon
                name="check"
                className="mt-0.5 h-4 w-4 shrink-0 text-accent-green"
              />
              <div>
                <p className="text-sm text-slate-200">
                  {SCOPE_INFO[scope] ?? scope}
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  {scope.replace("https://www.googleapis.com/auth/", "")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <GmailScanDialog open={scanOpen} onClose={() => setScanOpen(false)} />
    </div>
  );
}

function Step({
  n,
  title,
  text,
  action,
  done = false,
}: {
  n: number;
  title: string;
  text: string;
  action?: React.ReactNode;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-4">
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
          done
            ? "bg-accent-green/15 text-accent-green"
            : "bg-brand-soft text-brand-pink"
        }`}
      >
        {done ? <Icon name="check" className="h-4 w-4" /> : n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-100">{title}</p>
        <p className="text-sm text-slate-400">{text}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
