/* =============================================================
 * SHELLY OG — מנוע ניקוד עדיפות תוכן (Content Priority Score)
 * כל פריט במערכת מקבל ציון 0-100 על בסיס 12 ממדים.
 * הציון קובע את ההמלצה: מה לפרסם עכשיו, מה לשמור, מה רעש.
 * ============================================================= */

import type {
  ScoreBreakdown,
  PriorityClassification,
  EffortLevel,
  Urgency,
} from "./types";

/** משקלות הממדים — סכום = 1. מותאם למותג של יוצרת AI. */
export const SCORE_WEIGHTS: Record<keyof ScoreBreakdown, number> = {
  freshness: 0.1,
  trendUrgency: 0.13,
  brandRelevance: 0.14,
  audienceValue: 0.11,
  productionEffort: 0.07,
  readiness: 0.1,
  platformFit: 0.06,
  differentiation: 0.09,
  businessValue: 0.07,
  cameraPotential: 0.05,
  repurposingPotential: 0.04,
  strategicAuthority: 0.04,
};

export const SCORE_DIMENSION_LABELS: Record<keyof ScoreBreakdown, string> = {
  freshness: "טריות",
  trendUrgency: "דחיפות הטרנד",
  brandRelevance: "רלוונטיות למותג",
  audienceValue: "ערך לקהל",
  productionEffort: "קלות הפקה",
  readiness: "מוכנות",
  platformFit: "התאמה לפלטפורמה",
  differentiation: "בידול",
  businessValue: "ערך עסקי",
  cameraPotential: "פוטנציאל מצלמה",
  repurposingPotential: "פוטנציאל מחזור",
  strategicAuthority: "סמכות אסטרטגית",
};

/** מחשב ציון עדיפות משוקלל 0-100 מתוך פירוט 12 הממדים. */
export function computePriorityScore(breakdown: ScoreBreakdown): number {
  let total = 0;
  (Object.keys(SCORE_WEIGHTS) as (keyof ScoreBreakdown)[]).forEach((key) => {
    const value = clamp(breakdown[key], 0, 100);
    total += value * SCORE_WEIGHTS[key];
  });
  return Math.round(clamp(total, 0, 100));
}

/** ממפה ציון + הקשר לסיווג עדיפות סופי. */
export function classifyByScore(
  score: number,
  ctx: { readiness: number; urgency: Urgency; effort: EffortLevel }
): PriorityClassification {
  if (score < 32) return "not-worth-time";
  if (ctx.readiness >= 85 && score >= 62) return "publish-now";
  if (ctx.urgency === "critical" || ctx.urgency === "high") {
    return score >= 55 ? "create-today" : "save-later";
  }
  if (score >= 78) return "create-today";
  if (score >= 62) return "build-this-week";
  if (score >= 50 && ctx.effort === "deep-work") return "make-series";
  if (score >= 45) return "save-later";
  return "save-later";
}

/** טקסט עברי קצר לכל סיווג עדיפות. */
export const CLASSIFICATION_LABELS: Record<PriorityClassification, string> = {
  "publish-now": "לפרסם עכשיו",
  "create-today": "ליצור היום",
  "build-this-week": "לבנות השבוע",
  "save-later": "לשמור לאחר כך",
  "use-in-lecture": "להשתמש בהרצאה",
  "make-series": "להפוך לסדרה",
  recycle: "למחזר מתוכן ישן",
  "not-worth-time": "לא שווה זמן",
};

/** צבע נושא (Tailwind tone) לכל סיווג — לשימוש ב-Badge. */
export const CLASSIFICATION_TONE: Record<
  PriorityClassification,
  "pink" | "orange" | "purple" | "electric" | "lime" | "mute"
> = {
  "publish-now": "pink",
  "create-today": "orange",
  "build-this-week": "purple",
  "save-later": "mute",
  "use-in-lecture": "electric",
  "make-series": "lime",
  recycle: "electric",
  "not-worth-time": "mute",
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
  critical: "קריטית",
};

export const EFFORT_LABELS: Record<EffortLevel, string> = {
  "15min": "15 דקות",
  "30min": "30 דקות",
  "1hour": "שעה",
  "deep-work": "עבודה עמוקה",
};

export const EFFORT_MINUTES: Record<EffortLevel, number> = {
  "15min": 15,
  "30min": 30,
  "1hour": 60,
  "deep-work": 150,
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
