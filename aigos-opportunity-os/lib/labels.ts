// =====================================================================
// Hebrew display labels for the English enum values.
// =====================================================================

import type {
  InsightType,
  PriceStatus,
  RelationshipStage,
  ServiceType,
} from "./types";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  "Personal Consulting": "ייעוץ אישי",
  "AI Workshop": "סדנת AI",
  "Keynote Lecture": "הרצאת מפתח",
  "Team Training": "הכשרת צוות",
  "Creative Direction": "ניהול קריאייטיב",
  "AI Content Strategy": "אסטרטגיית תוכן AI",
  "Monthly Retainer": "ריטיינר חודשי",
  "Custom Project": "פרויקט מותאם",
  Other: "אחר",
};

export const PRICE_STATUS_LABELS: Record<PriceStatus, string> = {
  Proposed: "הוצע",
  Accepted: "התקבל",
  Rejected: "נדחה",
  Negotiating: "במשא ומתן",
  Unknown: "לא ידוע",
};

export const STAGE_LABELS: Record<RelationshipStage, string> = {
  "New Contact": "איש קשר חדש",
  "Warm Lead": "ליד חם",
  "Active Client": "לקוח פעיל",
  "Past Client": "לקוח עבר",
  Partner: "שותף",
  Media: "מדיה",
  Community: "קהילה",
  Unknown: "לא ידוע",
};

export const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  "Missed Opportunity": "הזדמנות שפוספסה",
  "Hot Lead": "ליד חם",
  "Price Reminder": "תזכורת מחיר",
  "Follow-up Risk": "סיכון פולואפ",
  Reactivation: "החייאת לקוח",
  "Content Idea": "רעיון לתוכן",
  "Collaboration Idea": "רעיון לשיתוף פעולה",
};

export function serviceLabel(s: string): string {
  return (SERVICE_LABELS as Record<string, string>)[s] ?? s;
}

export function priceStatusLabel(s: PriceStatus): string {
  return PRICE_STATUS_LABELS[s] ?? s;
}

export function stageLabel(s: RelationshipStage): string {
  return STAGE_LABELS[s] ?? s;
}

export function insightTypeLabel(s: InsightType): string {
  return INSIGHT_TYPE_LABELS[s] ?? s;
}
