"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { PageHeader, SectionHeading, EmptyState } from "@/components/ui";
import { ManagerNote } from "@/components/ManagerNote";
import { OpportunityCard } from "@/components/OpportunityCard";
import { FollowUpCard } from "@/components/FollowUpCard";
import { PriceTable } from "@/components/PriceTable";
import { SuggestedEmail } from "@/components/SuggestedEmail";
import { AddFollowUpDialog } from "@/components/AddFollowUpDialog";
import { AddPriceDialog } from "@/components/AddPriceDialog";
import { Icon } from "@/components/icons";
import { stageLabel } from "@/lib/labels";
import { draftFollowUpEmail, priceWarnings } from "@/lib/aiService";
import { formatRelative } from "@/lib/dateUtils";
import { formatMoney } from "@/lib/scoring";

export default function ContactProfilePage() {
  const params = useParams();
  const id = String(params.id);
  const { contacts, opportunities, prices, followUps } = useStore();
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    return (
      <div>
        <PageHeader title="איש קשר לא נמצא" />
        <EmptyState
          icon="contacts"
          title="לא מצאתי את איש הקשר הזה"
          text="ייתכן שהקישור ישן."
        />
        <Link href="/contacts" className="btn-ghost mt-4">
          <Icon name="arrow" className="h-4 w-4" />
          חזרה לאנשי הקשר
        </Link>
      </div>
    );
  }

  const contactOpps = opportunities.filter((o) => o.contactId === id);
  const contactPrices = prices.filter((p) => p.contactId === id);
  const contactFollowUps = followUps.filter(
    (f) => f.contactId === id && f.status !== "Done" && f.status !== "Cancelled",
  );

  const lastPrice =
    contactPrices.find((p) => p.priceCharged) ?? contactPrices[0];
  const previousPrice = lastPrice?.priceCharged ?? lastPrice?.priceProposed;
  const topic = contact.topicsTheyCareAbout[0];
  const warnings = priceWarnings(contact, prices);
  const suggestedMessage = draftFollowUpEmail(contact, topic, previousPrice);

  const managerNote = `${
    topic
      ? `${contact.name} מתעניינ/ת ב${topic}. `
      : ""
  }${
    previousPrice
      ? `בפעם הקודמת המחיר היה ${formatMoney(previousPrice)} — זה העוגן שלך. `
      : "אין עדיין רישום מחיר — שווה להתחיל אחד. "
  }הצעד החכם הבא: לשלוח עדכון קצר וממוקד ולהציע סשן המשך.`;

  return (
    <div>
      <Link
        href="/contacts"
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
      >
        <Icon name="arrow" className="h-4 w-4 rotate-180" />
        כל אנשי הקשר
      </Link>

      <PageHeader title={contact.name} subtitle={contact.role}>
        <button onClick={() => setFollowUpOpen(true)} className="btn-ghost">
          <Icon name="calendar" className="h-4 w-4" />
          פולואפ
        </button>
        <button onClick={() => setPriceOpen(true)} className="btn-primary">
          <Icon name="money" className="h-4 w-4" />
          רישום מחיר
        </button>
      </PageHeader>

      {/* Identity row */}
      <div className="card mb-6 flex flex-wrap items-center gap-4 p-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-xl font-bold text-white">
          {contact.name.charAt(0)}
        </span>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <Info icon="briefcase" value={contact.company || "—"} />
          <Info icon="mail" value={contact.email || "—"} />
          {contact.phone && <Info icon="contacts" value={contact.phone} />}
          <span className="chip border-brand-purple/30 bg-brand-soft text-slate-200">
            {stageLabel(contact.relationshipStage)}
          </span>
        </div>
        {contact.totalEstimatedValue > 0 && (
          <div className="ms-auto text-left">
            <div className="text-lg font-extrabold text-accent-green">
              {formatMoney(contact.totalEstimatedValue)}
            </div>
            <div className="text-[11px] text-slate-500">שווי מצטבר</div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <ManagerNote>{managerNote}</ManagerNote>
          </div>

          <section>
            <SectionHeading title="ההודעה הבאה המומלצת" />
            <SuggestedEmail
              email={suggestedMessage}
              recipientName={contact.name}
              recipientEmail={contact.email}
            />
          </section>

          <section>
            <SectionHeading
              title="הזדמנויות"
              count={contactOpps.length}
            />
            {contactOpps.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="אין הזדמנויות פתוחות"
                text="זה בדיוק מה שמחולל ההזדמנויות נועד לתקן."
              />
            ) : (
              <div className="space-y-4">
                {contactOpps.map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} />
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeading
              title="פולואפים פתוחים"
              count={contactFollowUps.length}
            />
            {contactFollowUps.length === 0 ? (
              <EmptyState
                icon="radar"
                title="אין פולואפ פתוח"
                text="אם יש סיבה לחזור — תוסיפי פולואפ עכשיו."
              />
            ) : (
              <div className="space-y-4">
                {contactFollowUps.map((f) => (
                  <FollowUpCard key={f.id} followUp={f} />
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeading
              title="היסטוריית מחירים"
              count={contactPrices.length}
            />
            {warnings.length > 0 && (
              <div className="mb-3 space-y-2">
                {warnings.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-3 text-sm text-slate-200"
                  >
                    <Icon
                      name="alert"
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber"
                    />
                    {w}
                  </div>
                ))}
              </div>
            )}
            <PriceTable prices={contactPrices} showClient={false} />
          </section>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <section className="card p-4">
            <SectionHeading title="סיכום הקשר" />
            <p className="text-sm leading-relaxed text-slate-300">
              {contact.relationshipSummary}
            </p>
            {contact.howWeMet && (
              <div className="mt-3">
                <span className="section-title text-slate-500">איך הכרנו</span>
                <p className="mt-0.5 text-sm text-slate-300">
                  {contact.howWeMet}
                </p>
              </div>
            )}
            <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Icon name="clock" className="h-3.5 w-3.5" />
                אינטראקציה אחרונה {formatRelative(contact.lastInteractionDate)}
              </span>
              {contact.nextFollowUpDate && (
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar" className="h-3.5 w-3.5" />
                  פולואפ הבא {formatRelative(contact.nextFollowUpDate)}
                </span>
              )}
            </div>
          </section>

          {contact.topicsTheyCareAbout.length > 0 && (
            <section className="card p-4">
              <SectionHeading title="נושאים שמעניינים אותם" />
              <div className="flex flex-wrap gap-2">
                {contact.topicsTheyCareAbout.map((t) => (
                  <span
                    key={t}
                    className="chip border-ink-border bg-ink-raised text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="card p-4">
            <SectionHeading title="היסטוריית מיילים" />
            <p className="text-sm text-slate-300">
              {contactOpps.length > 0
                ? `${contactOpps.length} שרשורי הזדמנות תועדו מול ${contact.name}.`
                : "אין עדיין שרשורים מתועדים."}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              סיכום מלא של תכתובות יופיע אחרי חיבור ל-Gmail.
            </p>
          </section>

          {contact.notes && (
            <section className="card p-4">
              <SectionHeading title="הערות" />
              <p className="text-sm text-slate-300">{contact.notes}</p>
            </section>
          )}

          {contact.tags.length > 0 && (
            <section className="card p-4">
              <SectionHeading title="תגיות" />
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((t) => (
                  <span
                    key={t}
                    className="chip border-brand-purple/25 bg-brand-soft text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <AddFollowUpDialog
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        contactId={contact.id}
        contactName={contact.name}
        email={contact.email}
      />
      <AddPriceDialog
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        contactId={contact.id}
        contactName={contact.name}
        company={contact.company}
        defaultService={contact.preferredService}
      />
    </div>
  );
}

function Info({ icon, value }: { icon: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-300">
      <Icon name={icon} className="h-4 w-4 text-slate-500" />
      {value}
    </span>
  );
}
