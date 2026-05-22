// =====================================================================
// Mock data loader.
//
// The JSON files in /data are written around a fixed baseline date so they
// stay readable. On load we shift every date forward by the gap between
// that baseline and "today", so the demo always looks fresh.
// =====================================================================

import type {
  AIInsight,
  AppSettings,
  Contact,
  EmailMessage,
  FollowUp,
  Opportunity,
  PriceRecord,
} from "./types";

import contactsRaw from "@/data/mockContacts.json";
import opportunitiesRaw from "@/data/mockOpportunities.json";
import pricesRaw from "@/data/mockPrices.json";
import followUpsRaw from "@/data/mockFollowUps.json";
import insightsRaw from "@/data/mockInsights.json";
import emailsRaw from "@/data/mockEmails.json";

/** The date the mock data in /data is written around. */
const BASELINE = "2026-05-22";
const DAY_MS = 24 * 60 * 60 * 1000;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z?$/;

function shiftDays(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const base = new Date(BASELINE);
  base.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - base.getTime()) / DAY_MS);
}

/** Deep-clone a record and shift any ISO date string by `days`. */
function rebase<T>(value: T, days: number): T {
  if (typeof value === "string") {
    if (DATE_ONLY.test(value)) {
      const d = new Date(value);
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10) as unknown as T;
    }
    if (DATE_TIME.test(value)) {
      const d = new Date(value);
      d.setTime(d.getTime() + days * DAY_MS);
      return d.toISOString() as unknown as T;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => rebase(v, days)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = rebase(v, days);
    return out as T;
  }
  return value;
}

const days = shiftDays();

export const mockContacts: Contact[] = rebase(
  contactsRaw as unknown as Contact[],
  days,
);
export const mockOpportunities: Opportunity[] = rebase(
  opportunitiesRaw as unknown as Opportunity[],
  days,
);
export const mockPrices: PriceRecord[] = rebase(
  pricesRaw as unknown as PriceRecord[],
  days,
);
export const mockFollowUps: FollowUp[] = rebase(
  followUpsRaw as unknown as FollowUp[],
  days,
);
export const mockInsights: AIInsight[] = rebase(
  insightsRaw as unknown as AIInsight[],
  days,
);
export const mockEmails: EmailMessage[] = rebase(
  emailsRaw as unknown as EmailMessage[],
  days,
);

/** Default app settings (mirrors the Settings tab in Google Sheets). */
export const defaultSettings: AppSettings = {
  defaultFollowUpDays: 14,
  hotLeadThreshold: 80,
  defaultCurrency: "ILS",
  tone: "tough_personal_manager",
  emailTone: "warm_confident",
  requireApprovalBeforeDraft: true,
  requireApprovalBeforeCalendar: true,
  requireApprovalBeforeEmailSend: true,
};
