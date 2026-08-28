"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader, SectionHeading, EmptyState } from "@/components/ui";
import { ManagerNote } from "@/components/ManagerNote";
import { FollowUpCard } from "@/components/FollowUpCard";
import { AddFollowUpDialog } from "@/components/AddFollowUpDialog";
import { Icon } from "@/components/icons";
import type { FollowUp } from "@/lib/types";
import { isOverdue, isThisWeek, isToday, daysFromToday } from "@/lib/dateUtils";

export default function FollowUpsPage() {
  const { followUps } = useStore();
  const [addOpen, setAddOpen] = useState(false);

  const buckets = useMemo(() => {
    const pending = followUps.filter((f) => f.status === "Pending");
    const byDate = (a: FollowUp, b: FollowUp) =>
      a.dueDate.localeCompare(b.dueDate);
    return {
      overdue: pending.filter((f) => isOverdue(f.dueDate)).sort(byDate),
      today: pending.filter((f) => isToday(f.dueDate)).sort(byDate),
      week: pending.filter((f) => isThisWeek(f.dueDate)).sort(byDate),
      later: pending
        .filter((f) => (daysFromToday(f.dueDate) ?? 0) > 7)
        .sort(byDate),
      snoozed: followUps.filter((f) => f.status === "Snoozed").sort(byDate),
      done: followUps.filter((f) => f.status === "Done"),
    };
  }, [followUps]);

  const note =
    buckets.overdue.length > 0
      ? `${buckets.overdue.length} פולואפים באיחור. כל יום שעובר זה עוד טיפה של כבוד מקצועי שמתאדה. בואי נסגור.`
      : buckets.today.length > 0
      ? `${buckets.today.length} פולואפים להיום. זה לא דחוף — זה פשוט חכם. אל תדחי.`
      : "אין פולואפ באיחור. מצוין. עכשיו תכנני את השבוע הבא במקום לחכות לו.";

  return (
    <div>
      <PageHeader
        title="ראדאר פולואפים"
        subtitle="מי צריך תשובה, מתי, ומה לשלוח — בלי לזכור כלום בעצמך."
      >
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <Icon name="plus" className="h-4 w-4" />
          פולואפ חדש
        </button>
      </PageHeader>

      <div className="mb-6">
        <ManagerNote tone={buckets.overdue.length > 0 ? "warning" : "default"}>
          {note}
        </ManagerNote>
      </div>

      <div className="space-y-8">
        <Bucket
          title="באיחור"
          accent="text-accent-red"
          items={buckets.overdue}
          empty="אין פולואפ באיחור. ככה זה צריך להיראות."
        />
        <Bucket
          title="להיום"
          accent="text-brand-orange"
          items={buckets.today}
          empty="אין פולואפ להיום."
        />
        <Bucket
          title="השבוע"
          accent="text-brand-purple"
          items={buckets.week}
          empty="השבוע פנוי מפולואפים."
        />
        <Bucket
          title="בהמשך"
          accent="text-accent-blue"
          items={buckets.later}
          empty="אין פולואפים מתוכננים קדימה."
        />
        <Bucket
          title="נדחו"
          accent="text-slate-400"
          items={buckets.snoozed}
          empty="אין פולואפים דחויים."
        />
      </div>

      {buckets.done.length > 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          {buckets.done.length} פולואפים כבר הושלמו. ככה זה נראה כשעובדים.
        </p>
      )}

      <AddFollowUpDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function Bucket({
  title,
  accent,
  items,
  empty,
}: {
  title: string;
  accent: string;
  items: FollowUp[];
  empty: string;
}) {
  return (
    <section>
      <SectionHeading title={title} count={items.length} accent={accent} />
      {items.length === 0 ? (
        <EmptyState icon="check" title={empty} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((f) => (
            <FollowUpCard key={f.id} followUp={f} />
          ))}
        </div>
      )}
    </section>
  );
}
