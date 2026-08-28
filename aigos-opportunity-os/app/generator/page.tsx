"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/ui";
import { ManagerNote } from "@/components/ManagerNote";
import { SuggestionCard } from "@/components/SuggestionCard";
import { generateOpportunitySuggestions } from "@/lib/aiService";

export default function GeneratorPage() {
  const { contacts, prices } = useStore();

  const suggestions = useMemo(
    () => generateOpportunitySuggestions(contacts, prices),
    [contacts, prices],
  );

  return (
    <div>
      <PageHeader
        title="מחולל הזדמנויות"
        subtitle="לא מחכים שיפנו אלייך. כאן מחליטים יזום למי לפנות — ולמה."
      />

      <div className="mb-6">
        <ManagerNote>
          הזדמנות הכי טובה היא לא תמיד זו שנכנסת לתיבה. היא זו שאת יוזמת. מצאתי{" "}
          {suggestions.length} אנשים מתוך הקשרים הקיימים שלך ששווה לפנות אליהם
          עכשיו — לפני שמישהי אחרת תעשה את זה.
        </ManagerNote>
      </div>

      {suggestions.length === 0 ? (
        <EmptyState
          icon="generator"
          title="אין כרגע הצעות יזומות"
          text="כשיהיו לך לקוחות עבר ושותפים — אציע מי לחזק."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {suggestions.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} />
          ))}
        </div>
      )}
    </div>
  );
}
