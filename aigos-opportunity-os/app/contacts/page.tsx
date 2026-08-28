"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/ui";
import { ManagerNote } from "@/components/ManagerNote";
import { ContactSummary } from "@/components/ContactSummary";
import type { RelationshipStage } from "@/lib/types";
import { stageLabel } from "@/lib/labels";

const STAGES: (RelationshipStage | "all")[] = [
  "all",
  "Active Client",
  "Past Client",
  "Warm Lead",
  "Partner",
  "Media",
  "Community",
  "New Contact",
];

export default function ContactsPage() {
  const { contacts } = useStore();
  const [stage, setStage] = useState<RelationshipStage | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = [...contacts];
    if (stage !== "all")
      list = list.filter((c) => c.relationshipStage === stage);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.company ?? "").toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) =>
      (b.lastInteractionDate ?? "").localeCompare(a.lastInteractionDate ?? ""),
    );
  }, [contacts, stage, query]);

  return (
    <div>
      <PageHeader
        title="אנשי קשר"
        subtitle="כל קשר הוא הזדמנות עתידית. כאן הם לא הולכים לאיבוד."
      />

      <div className="mb-5">
        <ManagerNote compact>
          {contacts.length} אנשי קשר במערכת. הקשרים החזקים ביותר הם לא תמיד
          החדשים — תבדקי מי התקרר.
        </ManagerNote>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={`chip transition-colors ${
              stage === s
                ? "border-brand-purple/50 bg-brand-soft text-white"
                : "border-ink-border bg-ink-raised text-slate-400 hover:text-slate-200"
            }`}
          >
            {s === "all" ? "הכל" : stageLabel(s)}
          </button>
        ))}
        <div className="ms-auto w-full sm:w-64">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי שם או חברה…"
            className="input"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="contacts"
          title="לא נמצאו אנשי קשר"
          text="נסי לשנות את הסינון."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ContactSummary key={c.id} contact={c} />
          ))}
        </div>
      )}
    </div>
  );
}
