"use client";

// =====================================================================
// In-memory store for demo mode.
//
// Holds all app data and the actions that mutate it. Changes live only
// for the current browser session - nothing is persisted. In Phase 2
// these actions would write through to Google Sheets.
// =====================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AIInsight,
  AppSettings,
  ConnectionStatus,
  Contact,
  FollowUp,
  Opportunity,
  OpportunityStatus,
  PriceRecord,
  SuggestedEmail,
} from "./types";
import {
  defaultSettings,
  mockContacts,
  mockFollowUps,
  mockInsights,
  mockOpportunities,
  mockPrices,
} from "./mockData";
import { draftFollowUpEmail } from "./aiService";
import { addDays, toISODate } from "./dateUtils";

// --- Toasts ------------------------------------------------------------
export type ToastTone = "info" | "success" | "warning";
export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

// --- Action input shapes ----------------------------------------------
export interface NewFollowUpInput {
  contactName: string;
  contactId?: string;
  email?: string;
  note: string;
  dueDate: string;
  reason?: string;
  suggestedTopic?: string;
  suggestedOffer?: string;
  opportunityId?: string;
}

export interface NewPriceInput {
  contactId: string;
  contactName: string;
  company?: string;
  serviceType: string;
  priceProposed?: number;
  priceCharged?: number;
  currency?: string;
  status?: PriceRecord["status"];
  context?: string;
}

// --- Store contract ----------------------------------------------------
interface StoreValue {
  opportunities: Opportunity[];
  contacts: Contact[];
  prices: PriceRecord[];
  followUps: FollowUp[];
  insights: AIInsight[];
  settings: AppSettings;
  connection: ConnectionStatus;
  toasts: Toast[];

  toast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;

  setOpportunityStatus: (id: string, status: OpportunityStatus) => void;
  markOpportunityHot: (id: string) => void;
  snoozeOpportunity: (id: string, days?: number) => void;

  addFollowUp: (input: NewFollowUpInput) => FollowUp;
  markFollowUpDone: (id: string) => void;
  snoozeFollowUp: (id: string, days?: number) => void;
  reactivateFollowUp: (id: string) => void;
  markFollowUpCalendarCreated: (id: string, eventId: string) => void;

  addPriceRecord: (input: NewPriceInput) => void;
  dismissInsight: (id: string) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;

  getContact: (id: string) => Contact | undefined;
}

const StoreContext = createContext<StoreValue | null>(null);

let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}${idCounter}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(
    () => mockOpportunities,
  );
  const [contacts, setContacts] = useState<Contact[]>(() => mockContacts);
  const [prices, setPrices] = useState<PriceRecord[]>(() => mockPrices);
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => mockFollowUps);
  const [insights, setInsights] = useState<AIInsight[]>(() => mockInsights);
  const [settings, setSettings] = useState<AppSettings>(() => defaultSettings);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => setMounted(true), []);

  const connection: ConnectionStatus = useMemo(
    () => ({
      demoMode: true,
      gmail: false,
      sheets: false,
      calendar: false,
      ai: false,
    }),
    [],
  );

  // --- Toasts ----------------------------------------------------------
  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = uid("toast");
      setToasts((t) => [...t, { id, message, tone }]);
      setTimeout(() => dismissToast(id), 5200);
    },
    [dismissToast],
  );

  // --- Opportunities ---------------------------------------------------
  const touch = (o: Opportunity): Opportunity => ({
    ...o,
    updatedAt: new Date().toISOString(),
  });

  const setOpportunityStatus = useCallback(
    (id: string, status: OpportunityStatus) => {
      setOpportunities((list) =>
        list.map((o) => (o.id === id ? touch({ ...o, status }) : o)),
      );
    },
    [],
  );

  const markOpportunityHot = useCallback(
    (id: string) => {
      setOpportunities((list) =>
        list.map((o) =>
          o.id === id
            ? touch({ ...o, status: "Hot Lead", priority: "Critical" })
            : o,
        ),
      );
      toast("סומן כליד חם. עכשיו אל תיתני לזה להתקרר.", "warning");
    },
    [toast],
  );

  const snoozeOpportunity = useCallback(
    (id: string, days = 7) => {
      const next = toISODate(addDays(new Date(), days));
      setOpportunities((list) =>
        list.map((o) =>
          o.id === id
            ? touch({ ...o, status: "Snoozed", nextFollowUpDate: next })
            : o,
        ),
      );
      toast(`נדחה ל-${days} ימים. רשמתי. לא נשכח.`, "info");
    },
    [toast],
  );

  // --- Contacts --------------------------------------------------------
  const getContact = useCallback(
    (id: string) => contacts.find((c) => c.id === id),
    [contacts],
  );

  const ensureContact = useCallback(
    (name: string, email?: string, existingId?: string): Contact => {
      if (existingId) {
        const found = contacts.find((c) => c.id === existingId);
        if (found) return found;
      }
      const byEmail = email
        ? contacts.find((c) => c.email === email)
        : undefined;
      if (byEmail) return byEmail;
      const byName = contacts.find((c) => c.name === name.trim());
      if (byName) return byName;

      const now = new Date().toISOString();
      const created: Contact = {
        id: uid("c"),
        createdAt: now,
        updatedAt: now,
        name: name.trim(),
        email: email || "",
        relationshipSummary: "איש קשר חדש שנוצר דרך פולואפ ידני.",
        topicsTheyCareAbout: [],
        totalEstimatedValue: 0,
        relationshipStage: "New Contact",
        tags: ["נוצר ידנית"],
      };
      setContacts((list) => [created, ...list]);
      return created;
    },
    [contacts],
  );

  // --- Follow-ups ------------------------------------------------------
  const addFollowUp = useCallback(
    (input: NewFollowUpInput): FollowUp => {
      const contact = ensureContact(
        input.contactName,
        input.email,
        input.contactId,
      );
      const draft: SuggestedEmail = draftFollowUpEmail(
        contact,
        input.suggestedTopic,
      );
      const followUp: FollowUp = {
        id: uid("f"),
        createdAt: new Date().toISOString(),
        contactId: contact.id,
        opportunityId: input.opportunityId,
        contactName: contact.name,
        dueDate: input.dueDate,
        reminderText: input.note,
        reason:
          input.reason ||
          "פולואפ ידני. אם זה נרשם — זה כי זה חשוב מספיק כדי לזכור.",
        suggestedTopic: input.suggestedTopic,
        suggestedOffer: input.suggestedOffer,
        suggestedEmailDraft: draft,
        status: "Pending",
        isCalendarCreated: false,
        needsApproval: true,
      };
      setFollowUps((list) => [followUp, ...list]);
      toast(
        `נוצר פולואפ ל${contact.name}. עכשיו זה באחריות שלי לזכור.`,
        "success",
      );
      return followUp;
    },
    [ensureContact, toast],
  );

  const markFollowUpDone = useCallback(
    (id: string) => {
      setFollowUps((list) =>
        list.map((f) => (f.id === id ? { ...f, status: "Done" } : f)),
      );
      toast("פולואפ הושלם. ככה זה נראה כשעובדים.", "success");
    },
    [toast],
  );

  const snoozeFollowUp = useCallback(
    (id: string, days = 7) => {
      setFollowUps((list) =>
        list.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "Snoozed",
                dueDate: toISODate(addDays(new Date(), days)),
              }
            : f,
        ),
      );
      toast(`נדחה ל-${days} ימים. אבל לא נשכח — זו כל המהות.`, "info");
    },
    [toast],
  );

  const reactivateFollowUp = useCallback((id: string) => {
    setFollowUps((list) =>
      list.map((f) => (f.id === id ? { ...f, status: "Pending" } : f)),
    );
  }, []);

  const markFollowUpCalendarCreated = useCallback(
    (id: string, eventId: string) => {
      setFollowUps((list) =>
        list.map((f) =>
          f.id === id
            ? { ...f, isCalendarCreated: true, calendarEventId: eventId }
            : f,
        ),
      );
    },
    [],
  );

  // --- Prices ----------------------------------------------------------
  const addPriceRecord = useCallback(
    (input: NewPriceInput) => {
      const record: PriceRecord = {
        id: uid("p"),
        createdAt: new Date().toISOString(),
        contactId: input.contactId,
        contactName: input.contactName,
        company: input.company,
        serviceType: input.serviceType,
        priceProposed: input.priceProposed,
        priceCharged: input.priceCharged,
        currency: input.currency || settings.defaultCurrency,
        dateOffered: toISODate(new Date()),
        status: input.status || "Proposed",
        context: input.context,
      };
      setPrices((list) => [record, ...list]);
      toast("רשומת מחיר נשמרה. עכשיו יש לך זיכרון, לא ניחושים.", "success");
    },
    [settings.defaultCurrency, toast],
  );

  // --- Insights --------------------------------------------------------
  const dismissInsight = useCallback((id: string) => {
    setInsights((list) =>
      list.map((i) => (i.id === id ? { ...i, isDismissed: true } : i)),
    );
  }, []);

  // --- Settings --------------------------------------------------------
  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      setSettings((s) => ({ ...s, ...partial }));
      toast("ההגדרות עודכנו.", "success");
    },
    [toast],
  );

  const value: StoreValue = {
    opportunities,
    contacts,
    prices,
    followUps,
    insights,
    settings,
    connection,
    toasts,
    toast,
    dismissToast,
    setOpportunityStatus,
    markOpportunityHot,
    snoozeOpportunity,
    addFollowUp,
    markFollowUpDone,
    snoozeFollowUp,
    reactivateFollowUp,
    markFollowUpCalendarCreated,
    addPriceRecord,
    dismissInsight,
    updateSettings,
    getContact,
  };

  if (!mounted) {
    return <BootSplash />;
  }

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

function BootSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-pulse-soft rounded-2xl bg-brand-gradient" />
        <p className="text-lg font-bold gradient-text">AI.GOS Opportunity OS</p>
        <p className="mt-1 text-sm text-slate-400">מחממת מנועים…</p>
      </div>
    </div>
  );
}
