// =====================================================================
// Scoring & money helpers. Pure functions, no side effects.
// =====================================================================

import type { Opportunity, Priority } from "./types";
import { daysFromToday } from "./dateUtils";

/** Statuses that mean the ball is in the user's court. */
export const WAITING_FOR_ME: Opportunity["status"][] = [
  "New",
  "Waiting for Me",
  "Proposal Needed",
  "Follow-up Needed",
];

/** Statuses considered "still open / live money". */
export const OPEN_STATUSES: Opportunity["status"][] = [
  "New",
  "Open",
  "Waiting for Me",
  "Waiting for Client",
  "Proposal Needed",
  "Proposal Sent",
  "Follow-up Needed",
  "Hot Lead",
  "Scheduled",
];

const PRIORITY_WEIGHT: Record<Priority, number> = {
  Low: 10,
  Medium: 25,
  High: 45,
  Critical: 60,
};

/**
 * A 0-100 heat score for an opportunity. Combines priority, confidence,
 * how overdue the follow-up is, and whether a proposal is pending.
 */
export function leadScore(opp: Opportunity): number {
  let score = PRIORITY_WEIGHT[opp.priority] ?? 20;
  score += Math.round((opp.confidenceScore ?? 0) * 0.25);

  const due = daysFromToday(opp.nextFollowUpDate);
  if (due !== null) {
    if (due < 0) score += Math.min(20, Math.abs(due) * 3);
    else if (due === 0) score += 12;
  }

  if (opp.status === "Proposal Needed" || opp.status === "Hot Lead") score += 10;
  if (opp.type === "Quote Request" || opp.type === "Warm Lead") score += 6;

  return Math.max(0, Math.min(100, score));
}

/** True when the opportunity is hot enough to demand attention now. */
export function isHot(opp: Opportunity, hotLeadThreshold = 80): boolean {
  if (opp.priority === "Critical") return true;
  if (opp.status === "Hot Lead") return true;
  return leadScore(opp) >= hotLeadThreshold;
}

/** Total estimated value still in play (open opportunities only). */
export function moneyOnTheTable(opportunities: Opportunity[]): number {
  return opportunities
    .filter((o) => OPEN_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + (o.estimatedValue ?? 0), 0);
}

/** Opportunities where the user owes the next move. */
export function waitingForMe(opportunities: Opportunity[]): Opportunity[] {
  return opportunities.filter((o) => WAITING_FOR_ME.includes(o.status));
}

/** Format money in the given currency, no decimals. */
export function formatMoney(amount: number, currency = "ILS"): string {
  try {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("he-IL")} ${currency}`;
  }
}

/** Confidence label in Hebrew. */
export function confidenceLabel(score: number): string {
  if (score >= 85) return "ביטחון גבוה";
  if (score >= 65) return "ביטחון בינוני";
  return "ביטחון נמוך";
}
