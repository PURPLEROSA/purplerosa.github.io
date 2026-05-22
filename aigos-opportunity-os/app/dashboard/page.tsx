"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { PageHeader, SectionHeading, EmptyState } from "@/components/ui";
import { DashboardCard } from "@/components/DashboardCard";
import { ManagerNote } from "@/components/ManagerNote";
import { InsightCard } from "@/components/InsightCard";
import { Icon } from "@/components/icons";
import {
  isHot,
  moneyOnTheTable,
  waitingForMe,
  formatMoney,
  OPEN_STATUSES,
} from "@/lib/scoring";
import {
  dashboardManagerNote,
  generateOpportunitySuggestions,
} from "@/lib/aiService";
import {
  isOverdue,
  isThisWeek,
  isToday,
  formatRelative,
  formatShortDate,
} from "@/lib/dateUtils";

export default function DashboardPage() {
  const { opportunities, contacts, prices, followUps, insights, settings } =
    useStore();

  const open = opportunities.filter((o) => OPEN_STATUSES.includes(o.status));
  const hotLeads = open.filter((o) => isHot(o, settings.hotLeadThreshold));
  const waiting = waitingForMe(opportunities);
  const pending = followUps.filter((f) => f.status === "Pending");
  const dueToday = pending.filter((f) => isToday(f.dueDate));
  const dueWeek = pending.filter((f) => isThisWeek(f.dueDate));
  const overdue = pending.filter((f) => isOverdue(f.dueDate));
  const quoteRequests = open.filter((o) => o.type === "Quote Request");
  const money = moneyOnTheTable(opportunities);
  const pastClients = contacts.filter(
    (c) => c.relationshipStage === "Past Client",
  );
  const suggestions = generateOpportunitySuggestions(contacts, prices);
  const liveInsights = insights.filter((i) => !i.isDismissed);

  const agenda = [...pending]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const managerNote = dashboardManagerNote({
    waitingForMe: waiting.length,
    hotLeads: hotLeads.length,
    followUpsToday: dueToday.length,
    overdue: overdue.length,
    quoteRequests: quoteRequests.length,
    moneyOnTable: money,
  });

  return (
    <div>
      <PageHeader
        title="שולחן הפיקוד"
        subtitle="הכל מה שצריך תשומת לב — במקום אחד, בלי לחפש."
      />

      <div className="mb-6">
        <ManagerNote tone={overdue.length > 0 ? "warning" : "default"}>
          שלי, {managerNote}
        </ManagerNote>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="הזדמנויות חמות"
          value={hotLeads.length}
          icon="fire"
          accent="pink"
          insight={
            hotLeads.length > 0
              ? "אלה הלידים שאם תזניחי אותם — פשוט תפסידי כסף."
              : "אין כרגע ליד בוער. זמן מצוין לייצר אחד."
          }
          ctaLabel="לתיבת ההזדמנויות"
          ctaHref="/opportunities"
        />
        <DashboardCard
          title="מחכים לתשובה ממך"
          value={waiting.length}
          icon="inbox"
          accent="orange"
          insight={
            waiting.length > 0
              ? "הם לא יזכירו לך. הם פשוט ילכו למישהי אחרת."
              : "אף אחד לא תקוע אצלך. נקי."
          }
          ctaLabel="מי מחכה"
          ctaHref="/opportunities"
        />
        <DashboardCard
          title="פולואפים להיום"
          value={dueToday.length}
          icon="calendar"
          accent="purple"
          insight={
            overdue.length > 0
              ? `ויש גם ${overdue.length} באיחור. זה לא נעלם לבד.`
              : dueToday.length > 0
              ? "סגרי אותם היום, לא 'אחר כך'."
              : "אין פולואפ דחוף להיום."
          }
          ctaLabel="לראדאר הפולואפים"
          ctaHref="/followups"
        />
        <DashboardCard
          title="פולואפים השבוע"
          value={dueWeek.length}
          icon="radar"
          accent="blue"
          insight={
            dueWeek.length > 0
              ? "תכנון קטן עכשיו חוסך ריצה מטורפת אחר כך."
              : "השבוע פנוי מפולואפים. תכנני קדימה."
          }
          ctaLabel="לתכנון השבוע"
          ctaHref="/followups"
        />
        <DashboardCard
          title="בקשות הצעת מחיר"
          value={quoteRequests.length}
          icon="money"
          accent="amber"
          insight={
            quoteRequests.length > 0
              ? "כל בקשת מחיר פתוחה היא כסף שמחכה לתשובה."
              : "אין בקשת מחיר פתוחה כרגע."
          }
          ctaLabel="לטיפול בהצעות"
          ctaHref="/opportunities"
        />
        <DashboardCard
          title="כסף על השולחן"
          value={formatMoney(money)}
          icon="money"
          accent="green"
          insight="זה הסכום המשוער של ההזדמנויות הפתוחות. אל תיתני לו להירקב."
          ctaLabel="מה פתוח"
          ctaHref="/opportunities"
        />
        <DashboardCard
          title="לקוחות עבר להחייאה"
          value={pastClients.length}
          icon="contacts"
          accent="orange"
          insight={
            pastClients.length > 0
              ? "לקוח שכבר שילם לך פעם — קל פי כמה להחזיר."
              : "אין לקוחות עבר רשומים עדיין."
          }
          ctaLabel="למחולל ההזדמנויות"
          ctaHref="/generator"
        />
        <DashboardCard
          title="הצעות יזומות"
          value={suggestions.length}
          icon="generator"
          accent="purple"
          insight="אנשים ששווה לפנות אליהם — גם בלי שביקשו ראשונים."
          ctaLabel="ראי את ההצעות"
          ctaHref="/generator"
        />
      </div>

      {/* Two columns: agenda + suggestions teaser */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeading title="מה מתוכנן" count={agenda.length} />
          {agenda.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="היומן נקי מפולואפים"
              text="כשתוסיפי פולואפ הוא יופיע כאן."
            />
          ) : (
            <div className="card divide-y divide-ink-border">
              {agenda.map((f) => {
                const late = isOverdue(f.dueDate);
                return (
                  <Link
                    key={f.id}
                    href="/followups"
                    className="flex items-center gap-3 p-3 hover:bg-ink-raised/40"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        late
                          ? "bg-accent-red/15 text-accent-red"
                          : "bg-ink-raised text-slate-400"
                      }`}
                    >
                      <Icon name="calendar" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-100">
                        {f.contactName}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {f.reminderText}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        late ? "text-accent-red" : "text-slate-400"
                      }`}
                    >
                      {formatRelative(f.dueDate)}
                      <br />
                      <span className="text-[11px] font-normal text-slate-500">
                        {formatShortDate(f.dueDate)}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-xs text-slate-500">
            אירועי יומן אמיתיים יופיעו כאן אחרי חיבור ל-Google Calendar.
          </p>
        </section>

        <section>
          <SectionHeading title="הזדמנויות יזומות" count={suggestions.length} />
          <div className="card p-4">
            <p className="text-sm text-slate-300">
              המערכת מצאה {suggestions.length} אנשים ששווה לפנות אליהם החודש —
              לקוחות עבר, שותפים וקשרים שהתקררו.
            </p>
            <div className="mt-3 space-y-2">
              {suggestions.slice(0, 3).map((s) => (
                <Link
                  key={s.id}
                  href="/generator"
                  className="flex items-center gap-2 rounded-lg border border-ink-border bg-ink-soft/60 p-2.5 hover:border-brand-purple/40"
                >
                  <Icon
                    name="sparkles"
                    className="h-4 w-4 shrink-0 text-brand-pink"
                  />
                  <span className="flex-1 text-sm text-slate-200">
                    {s.contactName} — {s.topicToMention}
                  </span>
                  <span className="text-xs text-slate-500">
                    {s.confidenceScore}%
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/generator"
              className="btn-primary mt-4 w-full text-sm"
            >
              <Icon name="generator" className="h-4 w-4" />
              פתחי את מחולל ההזדמנויות
            </Link>
          </div>
        </section>
      </div>

      {/* AI Manager Notes */}
      <section className="mt-8">
        <SectionHeading
          title="פתקים מהמנהלת"
          count={liveInsights.length}
          accent="gradient-text"
        />
        {liveInsights.length === 0 ? (
          <EmptyState
            icon="sparkles"
            title="אין תובנות פתוחות"
            text="טיפלת בכולן. כל הכבוד."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {liveInsights.map((i) => (
              <InsightCard key={i.id} insight={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
