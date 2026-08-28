"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageHeader, SectionHeading } from "@/components/ui";
import { ManagerNote } from "@/components/ManagerNote";
import { Field } from "@/components/Modal";
import { Icon } from "@/components/icons";
import { SERVICE_LABELS } from "@/lib/labels";
import { typeLabel } from "@/components/StatusBadge";
import type { OpportunityType, ServiceType } from "@/lib/types";

const ALL_TYPES: OpportunityType[] = [
  "Speaking Request",
  "Workshop Request",
  "Consulting Request",
  "Quote Request",
  "Collaboration",
  "Media Request",
  "Follow-up Needed",
  "Past Client Reactivation",
  "Warm Lead",
  "Content Opportunity",
  "Not Relevant",
];

export default function SettingsPage() {
  const { settings, updateSettings, connection } = useStore();
  const [draft, setDraft] = useState(settings);

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  return (
    <div>
      <PageHeader
        title="הגדרות"
        subtitle="ככה את מכווננת את המערכת שתעבוד בדיוק בשבילך."
      />

      <div className="mb-6">
        <ManagerNote compact>
          ההגדרות החשובות ביותר הן כללי האישור. כל עוד הם דולקים — שום מייל לא
          יישלח ושום אירוע לא ייווצר בלי שתאשרי. אל תכבי אותם סתם.
        </ManagerNote>
      </div>

      <div className="space-y-6">
        {/* Tone */}
        <section className="card p-5">
          <SectionHeading title="טון המערכת" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="איך המערכת מדברת אלייך"
              hint="זה משפיע על הפתקים והתובנות."
            >
              <select
                className="input"
                value={draft.tone}
                onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
              >
                <option value="tough_personal_manager">
                  מנהלת אישית קשוחה
                </option>
                <option value="balanced_professional">
                  מקצועי ומאוזן
                </option>
                <option value="supportive_gentle">תומך ועדין</option>
              </select>
            </Field>
            <Field
              label="טון טיוטות המייל"
              hint="הסגנון של הטיוטות שייכתבו עבורך."
            >
              <select
                className="input"
                value={draft.emailTone}
                onChange={(e) =>
                  setDraft({ ...draft, emailTone: e.target.value })
                }
              >
                <option value="warm_confident">חם ובטוח</option>
                <option value="short_direct">ענייני וקצר</option>
                <option value="personal_friendly">אישי וחברי</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Rules */}
        <section className="card p-5">
          <SectionHeading title="כללי פולואפ ולידים" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="ימים עד פולואפ (ברירת מחדל)">
              <input
                type="number"
                min={1}
                max={120}
                className="input"
                value={draft.defaultFollowUpDays}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    defaultFollowUpDays: Number(e.target.value) || 14,
                  })
                }
              />
            </Field>
            <Field
              label="סף ליד חם"
              hint="ניקוד מ-0 עד 100. גבוה יותר = פחות לידים מסומנים כחמים."
            >
              <input
                type="number"
                min={40}
                max={100}
                className="input"
                value={draft.hotLeadThreshold}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    hotLeadThreshold: Number(e.target.value) || 80,
                  })
                }
              />
            </Field>
            <Field label="מטבע ברירת מחדל">
              <select
                className="input"
                value={draft.defaultCurrency}
                onChange={(e) =>
                  setDraft({ ...draft, defaultCurrency: e.target.value })
                }
              >
                <option value="ILS">₪ שקל (ILS)</option>
                <option value="USD">$ דולר (USD)</option>
                <option value="EUR">€ אירו (EUR)</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Approval rules */}
        <section className="card p-5">
          <SectionHeading title="כללי אישור (חשוב)" />
          <div className="space-y-2">
            <Toggle
              label="לדרוש אישור לפני יצירת טיוטת מייל"
              value={draft.requireApprovalBeforeDraft}
              onChange={(v) =>
                setDraft({ ...draft, requireApprovalBeforeDraft: v })
              }
            />
            <Toggle
              label="לדרוש אישור לפני יצירת אירוע ביומן"
              value={draft.requireApprovalBeforeCalendar}
              onChange={(v) =>
                setDraft({ ...draft, requireApprovalBeforeCalendar: v })
              }
            />
            <Toggle
              label="לדרוש אישור לפני שליחת מייל"
              value={draft.requireApprovalBeforeEmailSend}
              onChange={(v) =>
                setDraft({ ...draft, requireApprovalBeforeEmailSend: v })
              }
              locked
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            המערכת לעולם לא שולחת מיילים בעצמה. כלל זה נעול להגנתך.
          </p>
        </section>

        {/* Save */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {dirty ? "יש שינויים שלא נשמרו." : "הכל שמור."}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setDraft(settings)}
              disabled={!dirty}
              className="btn-soft"
            >
              ביטול שינויים
            </button>
            <button
              onClick={() => updateSettings(draft)}
              disabled={!dirty}
              className="btn-primary"
            >
              <Icon name="check" className="h-4 w-4" />
              שמירת הגדרות
            </button>
          </div>
        </div>

        {/* Reference: categories */}
        <section className="card p-5">
          <SectionHeading title="סוגי הזדמנויות" />
          <p className="mb-3 text-sm text-slate-400">
            הקטגוריות שהמערכת מזהה אוטומטית מתוך מיילים.
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_TYPES.map((t) => (
              <span
                key={t}
                className="chip border-brand-purple/25 bg-brand-soft text-slate-300"
              >
                {typeLabel(t)}
              </span>
            ))}
          </div>
        </section>

        {/* Reference: services */}
        <section className="card p-5">
          <SectionHeading title="סוגי שירות" />
          <p className="mb-3 text-sm text-slate-400">
            השירותים שאפשר לתמחר ולתעד בזיכרון המחירים.
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SERVICE_LABELS) as ServiceType[]).map((s) => (
              <span
                key={s}
                className="chip border-ink-border bg-ink-raised text-slate-300"
              >
                {SERVICE_LABELS[s]}
              </span>
            ))}
          </div>
        </section>

        {/* Google connection */}
        <section className="card p-5">
          <SectionHeading title="חיבור Google" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  connection.demoMode
                    ? "bg-accent-amber"
                    : "bg-accent-green"
                }`}
              />
              <span className="text-slate-300">
                {connection.demoMode
                  ? "מצב דמו — לא מחובר ל-Google"
                  : "מחובר ל-Google Workspace"}
              </span>
            </div>
            <Link href="/setup" className="btn-ghost">
              <Icon name="plug" className="h-4 w-4" />
              מסך החיבור
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
  locked = false,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-ink-border bg-ink-soft/60 p-3">
      <span className="text-sm text-slate-200">
        {label}
        {locked && (
          <span className="ms-2 text-xs text-slate-500">(נעול)</span>
        )}
      </span>
      <button
        type="button"
        disabled={locked}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? "bg-brand-gradient" : "bg-ink-border"
        } ${locked ? "opacity-70" : ""}`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            value ? "left-0.5" : "left-[22px]"
          }`}
        />
      </button>
    </div>
  );
}
