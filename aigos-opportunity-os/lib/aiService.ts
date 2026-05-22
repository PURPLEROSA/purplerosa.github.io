// =====================================================================
// aiService - the "brain" of AI.GOS Opportunity OS.
//
// Phase 1 (now): rule-based mock intelligence. Fully deterministic,
//                no network, works offline.
// Phase 2 (later): swap the marked functions to call Gemini / Claude.
//
// GOLDEN RULE: every AI output separates
//   facts  -> taken straight from the email / sheet / calendar
//   guesses-> the AI's assumptions, to be treated with suspicion
//   action -> a single suggested next step, never executed automatically
// =====================================================================

import type {
  ClassificationResult,
  Contact,
  EmailMessage,
  Opportunity,
  OpportunitySuggestion,
  OpportunityType,
  PriceRecord,
  Priority,
  SuggestedEmail,
} from "./types";
import { daysFromToday, toISODate, addDays } from "./dateUtils";
import { formatMoney } from "./scoring";

// ---------------------------------------------------------------------
// Provider configuration (Phase 2)
// ---------------------------------------------------------------------

export type AIProvider = "mock" | "gemini" | "claude";

/** Which provider is active. In Phase 1 this is always "mock". */
export function activeProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "mock";
}

export function isAIConfigured(): boolean {
  return activeProvider() !== "mock";
}

// ---------------------------------------------------------------------
// Keyword dictionaries for classifyEmail
// ---------------------------------------------------------------------

interface KeywordGroup {
  type: OpportunityType;
  keywords: string[];
}

const KEYWORD_GROUPS: KeywordGroup[] = [
  {
    type: "Quote Request",
    keywords: [
      "כמה עולה",
      "הצעת מחיר",
      "כמה את לוקחת",
      "כמה זה עולה",
      "מה המחיר",
      "how much do you charge",
      "send a proposal",
      "quote",
      "pricing",
    ],
  },
  {
    type: "Speaking Request",
    keywords: [
      "להזמין אותך",
      "הרצאה",
      "כנס",
      "דוברת",
      "we would like to invite you",
      "speaking opportunity",
      "keynote",
      "conference",
    ],
  },
  {
    type: "Workshop Request",
    keywords: [
      "סדנה",
      "סדנת",
      "הדרכה",
      "הכשרה",
      "תהליך למידה",
      "workshop",
      "training",
    ],
  },
  {
    type: "Consulting Request",
    keywords: [
      "ייעוץ",
      "ליווי",
      "פגישת מומחית",
      "שיחת ייעוץ",
      "consulting",
      "advisory",
      "mentoring",
    ],
  },
  {
    type: "Collaboration",
    keywords: [
      "שיתוף פעולה",
      'שת"פ',
      "תוכן משותף",
      "פודקאסט",
      "collaboration",
      "partnership",
      "podcast",
    ],
  },
  {
    type: "Media Request",
    keywords: [
      "לראיין אותך",
      "ראיון",
      "כתבה",
      "אייטם",
      "פאנל",
      "interview",
      "press",
      "panel",
    ],
  },
  {
    type: "Follow-up Needed",
    keywords: [
      "דברי איתי עוד חודש",
      "נדבר אחרי",
      "תחזרי אליי",
      "נדבר אחרי החג",
      "follow up next month",
      "let's talk after",
      "talk to me next",
    ],
  },
];

const BUYING_INTENT = [
  "אשמח להתקדם",
  "בוא נסגור",
  "מתי את פנויה",
  "אפשר לקבוע",
  "תשלחי לי פרטים",
  "אפשר פרטים",
  "available dates",
  "send me details",
  "let's move forward",
];

const SPAM_SIGNALS = [
  "הצעה בלעדית",
  "50% הנחה",
  "הירשם היום",
  "בתוקף ל-24 שעות",
  "אל תפספס",
  "limited time",
  "click here",
  "unsubscribe",
];

function countHits(haystack: string, needles: string[]): string[] {
  return needles.filter((n) => haystack.includes(n.toLowerCase()));
}

// ---------------------------------------------------------------------
// classifyEmail - turn a raw email into a structured opportunity guess
// ---------------------------------------------------------------------

export function classifyEmail(email: EmailMessage): ClassificationResult {
  const text = `${email.subject}\n${email.body}\n${email.snippet}`.toLowerCase();

  // 1. Spam / not relevant ------------------------------------------------
  const spamHits = countHits(text, SPAM_SIGNALS);
  if (spamHits.length >= 2) {
    return {
      opportunityType: "Not Relevant",
      priority: "Low",
      status: "Closed",
      summary: "מייל שיווקי / לא קשור להזדמנות עסקית.",
      facts: [`זוהו ${spamHits.length} סימני דיוור שיווקי.`],
      aiAssumptions: ["כנראה דיוור אוטומטי ולא פנייה אישית."],
      suggestedNextStep: "אפשר להתעלם. לא דורש פעולה.",
      confidenceScore: 90,
      needsUserApproval: false,
    };
  }

  // 2. Match opportunity type --------------------------------------------
  let bestType: OpportunityType = "Warm Lead";
  let bestHits: string[] = [];
  for (const group of KEYWORD_GROUPS) {
    const hits = countHits(text, group.keywords);
    if (hits.length > bestHits.length) {
      bestHits = hits;
      bestType = group.type;
    }
  }

  const buyingHits = countHits(text, BUYING_INTENT);
  const facts: string[] = [];
  const aiAssumptions: string[] = [];

  facts.push(`הפנייה התקבלה מ-${email.fromName} בתאריך ${email.date}.`);
  if (bestHits.length > 0) {
    facts.push(`זוהו ביטויי מפתח: "${bestHits.slice(0, 3).join('", "')}".`);
  }
  if (buyingHits.length > 0) {
    facts.push(`זוהו ${buyingHits.length} ביטויים שמרמזים על כוונת קנייה.`);
  }

  // 3. Confidence ---------------------------------------------------------
  let confidence = 45 + bestHits.length * 14 + buyingHits.length * 8;
  confidence = Math.max(30, Math.min(96, confidence));

  // 4. Priority -----------------------------------------------------------
  let priority: Priority = "Medium";
  if (bestType === "Quote Request" && buyingHits.length > 0) priority = "Critical";
  else if (buyingHits.length >= 2) priority = "High";
  else if (bestType === "Quote Request" || bestType === "Speaking Request")
    priority = "High";
  else if (bestType === "Not Relevant") priority = "Low";

  // 5. Status -------------------------------------------------------------
  let status: Opportunity["status"] = "New";
  if (bestType === "Quote Request") status = "Proposal Needed";
  else if (bestType === "Follow-up Needed") status = "Follow-up Needed";

  // 6. Warm vs hot --------------------------------------------------------
  if (buyingHits.length >= 1 && bestType !== "Not Relevant") {
    aiAssumptions.push(
      buyingHits.length >= 2
        ? "כוונת קנייה גבוהה — נראה ליד חם."
        : "יש סימני התעניינות — שווה לטפל מהר.",
    );
  }
  if (bestHits.length === 0) {
    aiAssumptions.push(
      "לא זוהו ביטויי מפתח ברורים — ייתכן שזו לא הזדמנות עסקית.",
    );
  }

  // 7. Suggested follow-up date ------------------------------------------
  const followUpOffset = bestType === "Quote Request" ? 1 : 3;
  const suggestedFollowUpDate = toISODate(addDays(new Date(), followUpOffset));

  // 8. Suggested next step -----------------------------------------------
  const nextStepByType: Record<OpportunityType, string> = {
    "Quote Request": "להכין ולשלוח הצעת מחיר תוך 24 שעות.",
    "Speaking Request": "להשיב עם זמינות בתאריכים וטווח מחיר.",
    "Workshop Request": "לשלוח פרטי סדנה אפשריים ולתאם שיחת אפיון.",
    "Consulting Request": "להציע פגישת מומחית ראשונה ולתאם תאריך.",
    Collaboration: "להשיב עם פורמט קונקרטי לשיתוף הפעולה.",
    "Media Request": "להשיב חיובי ולהציע חלונות זמן לראיון.",
    "Follow-up Needed": "ליצור תזכורת פולואפ למועד שביקשו.",
    "Past Client Reactivation": "לשלוח עדכון קצר ולהציע סשן המשך.",
    "Warm Lead": "להשיב מהר ולברר מה בדיוק הצורך.",
    "Content Opportunity": "לשקול להפוך את הנושא לתוכן או וובינר.",
    "Not Relevant": "אפשר להתעלם.",
  };

  const lowConfidence = confidence < 65;

  return {
    opportunityType: bestType,
    priority,
    status,
    summary: `${email.fromName}${email.company ? ` (${email.company})` : ""} — ${
      bestType === "Not Relevant" ? "פנייה לא עסקית" : describeType(bestType)
    }.`,
    facts,
    aiAssumptions,
    suggestedNextStep: nextStepByType[bestType],
    suggestedFollowUpDate,
    suggestedEmailDraft: draftEmailForType(email, bestType),
    confidenceScore: confidence,
    needsUserApproval: lowConfidence || priority === "Critical",
  };
}

function describeType(type: OpportunityType): string {
  const map: Record<OpportunityType, string> = {
    "Quote Request": "בקשת הצעת מחיר",
    "Speaking Request": "פנייה להרצאה",
    "Workshop Request": "בקשה לסדנה",
    "Consulting Request": "בקשת ייעוץ",
    Collaboration: "הצעת שיתוף פעולה",
    "Media Request": "בקשת ראיון / מדיה",
    "Follow-up Needed": "מישהו שצריך לחזור אליו",
    "Past Client Reactivation": "לקוח עבר להחייאה",
    "Warm Lead": "ליד חם",
    "Content Opportunity": "הזדמנות לתוכן",
    "Not Relevant": "לא רלוונטי",
  };
  return map[type];
}

// ---------------------------------------------------------------------
// Email drafting (Phase 2: replace body with an LLM call)
// ---------------------------------------------------------------------

function draftEmailForType(
  email: EmailMessage,
  type: OpportunityType,
): SuggestedEmail {
  const name = email.fromName.split(" ")[0] || email.fromName;
  const bodyByType: Partial<Record<OpportunityType, string>> = {
    "Quote Request": `היי ${name},\nתודה על הפנייה. אשמח לשלוח הצעה מדויקת — רק כמה פרטים קצרים כדי שאתאים אותה בול אליכם.\nאחזור אליך עם הצעה מסודרת היום.\n\nשלי`,
    "Speaking Request": `היי ${name},\nשמחה שחשבתם עליי. אשמח לקחת חלק.\nנשמח לדעת את התאריך והפורמט המדויקים — ואני אחזיק לכם חלון זמן.\n\nשלי`,
    "Workshop Request": `היי ${name},\nתודה על הפנייה. אשמח לבנות סדנה שמתאימה בדיוק לצוות שלכם.\nנקבע שיחת אפיון קצרה כדי שאבין מה הכי רלוונטי?\n\nשלי`,
    "Consulting Request": `היי ${name},\nתודה על הפנייה. אני מציעה להתחיל בפגישת מיקוד שבה נמפה יחד מה הכי רלוונטי עבורכם.\nמתוך זה נבנה המשך מסודר. נוח לכם בשבוע הקרוב?\n\nשלי`,
  };
  return {
    subject: `תשובה: ${email.subject}`,
    body:
      bodyByType[type] ||
      `היי ${name},\nתודה על הפנייה — קיבלתי וזה נראה מעניין.\nאחזור אליך בקרוב עם המשך מסודר.\n\nשלי`,
  };
}

/**
 * Draft a warm, confident follow-up email for a contact.
 * Phase 2: replace the body with an LLM call that uses contact history.
 */
export function draftFollowUpEmail(
  contact: Contact,
  topic?: string,
  previousPrice?: number,
): SuggestedEmail {
  const name = contact.name.split(" ")[0] || contact.name;
  const subject = "חשבתי שזה יכול לעניין אותך";
  const topicLine = topic || contact.topicsTheyCareAbout[0] || "AI יישומי";
  const priceLine = previousPrice
    ? `\n(לידיעתך — נוכל לבנות משהו בקנה מידה דומה לפעם הקודמת.)`
    : "";
  return {
    subject,
    body: `היי ${name},\nנזכרתי שאמרת שנדבר שוב כשיהיה משהו חדש סביב ${topicLine}.\nיש עכשיו כמה כיוונים שיכולים להיות רלוונטיים ממש עבורכם.\nאפשר לקבוע פגישת עדכון קצרה, או לבנות לכם סשן ממוקד.${priceLine}\nרוצה שאשלח כמה אופציות?\n\nשלי`,
  };
}

// ---------------------------------------------------------------------
// Opportunity Generator - proactive suggestions from existing contacts
// ---------------------------------------------------------------------

function lastAcceptedPrice(
  contactId: string,
  prices: PriceRecord[],
): PriceRecord | undefined {
  return prices
    .filter((p) => p.contactId === contactId && p.priceCharged)
    .sort((a, b) => (b.dateAccepted || "").localeCompare(a.dateAccepted || ""))[0];
}

export function generateOpportunitySuggestions(
  contacts: Contact[],
  prices: PriceRecord[],
): OpportunitySuggestion[] {
  const proactiveStages = ["Past Client", "Partner", "Community", "Active Client"];

  return contacts
    .filter((c) => {
      const idle = daysFromToday(c.lastInteractionDate);
      const idleEnough = idle !== null && idle <= -25;
      return proactiveStages.includes(c.relationshipStage) || idleEnough;
    })
    .map((c) => buildSuggestion(c, prices))
    .sort((a, b) => b.confidenceScore - a.confidenceScore);
}

function buildSuggestion(
  contact: Contact,
  prices: PriceRecord[],
): OpportunitySuggestion {
  const idleDays = Math.abs(daysFromToday(contact.lastInteractionDate) ?? 0);
  const months = Math.max(1, Math.round(idleDays / 30));
  const lastPrice = lastAcceptedPrice(contact.id, prices);
  const previousPrice = lastPrice?.priceCharged;
  const topic = contact.topicsTheyCareAbout[0] || "חידושי AI";

  const priceRange = previousPrice
    ? `${formatMoney(previousPrice)} - ${formatMoney(
        Math.round(previousPrice * 1.35),
      )}`
    : "לפי היקף — להציע טווח, לא מספר בודד";

  let whyNow: string;
  let riskIfIgnored: string;
  let managerNote: string;
  let confidence: number;

  switch (contact.relationshipStage) {
    case "Past Client":
      whyNow = `עברו כ-${months} חודשים מאז ההתקשרות האחרונה. החלון המתוק להחייאה הוא עכשיו.`;
      riskIfIgnored = "לקוח עבר טוב שיישכח אותך וילך למתחרה כשהצורך יחזור.";
      managerNote = `זה לא דחוף, אבל זה מאוד חכם. לקוח שכבר שילם לך פעם — קל פי כמה להחזיר אותו מאשר למצוא חדש. אל תתני לזה להפוך לארכיאולוגיה.`;
      confidence = 82;
      break;
    case "Partner":
      whyNow = `${contact.name} הוא ערוץ הפצה. שקט ארוך מדי מול שותפים = פחות הזמנות.`;
      riskIfIgnored = "השותף יזכור מישהו אחר בפעם הבאה שצריך דוברת.";
      managerNote = `שותפים שווים זהב, אבל רק אם נשארים על הרדאר שלהם. שלחי משהו קצר וערכי — לא בקשה, אלא תזכורת שאת קיימת ורלוונטית.`;
      confidence = 76;
      break;
    case "Community":
      whyNow = `יש כאן קהל גדול ומדויק. שת"פ קהילתי נכון הוא מכונת לידים.`;
      riskIfIgnored = "הזדמנות חשיפה לקהל יעד מושלם שתתאדה בלי מעקב.";
      managerNote = `חשיפה זה לא תשלום, אבל חשיפה נכונה מביאה תשלום. אם נכנסת לקהילה — תוודאי שיש CTA בסוף, אחרת זו התנדבות.`;
      confidence = 70;
      break;
    default:
      whyNow = `${contact.name} לקוח/ה פעיל/ה — זה הזמן להרחיב, לא רק לתחזק.`;
      riskIfIgnored = "לקוח מרוצה שלא שמע ממך פספס הזדמנות לקנות עוד.";
      managerNote = `לקוח מרוצה הוא ההזדמנות הכי זולה שיש לך. אל תחכי שהוא יבקש — תציעי לו את הצעד הבא.`;
      confidence = 73;
  }

  return {
    id: `sug-${contact.id}`,
    contactId: contact.id,
    contactName: contact.name,
    company: contact.company,
    whyNow,
    topicToMention: `מה חדש בתחום ${topic}`,
    suggestedOffer:
      contact.preferredService === "Keynote Lecture"
        ? "הרצאת עדכון או פאנל"
        : contact.preferredService === "Monthly Retainer"
        ? "מקצה ריטיינר קצר או סשן רענון"
        : "סשן עדכון ממוקד או סדנה קצרה",
    suggestedPriceRange: priceRange,
    previousPrice,
    suggestedEmailDraft: draftFollowUpEmail(contact, topic, previousPrice),
    confidenceScore: confidence,
    riskIfIgnored,
    managerNote,
  };
}

// ---------------------------------------------------------------------
// Price intelligence
// ---------------------------------------------------------------------

/** Tough manager warnings about pricing for a given contact. */
export function priceWarnings(
  contact: Contact | undefined,
  prices: PriceRecord[],
): string[] {
  const warnings: string[] = [];
  if (!contact) return warnings;

  const last = lastAcceptedPrice(contact.id, prices);
  if (last?.priceCharged) {
    warnings.push(
      `בפעם הקודמת ${contact.name} שילמ/ה ${formatMoney(
        last.priceCharged,
      )}. אל תציעי פחות בלי סיבה ממש טובה.`,
    );
  }

  if (
    contact.relationshipStage === "Active Client" ||
    contact.company?.includes("בנק") ||
    contact.tags.includes("ארגוני")
  ) {
    warnings.push(
      "זה לקוח ארגוני. אל תתמחרי כמו טובה מהירה — תמחרי לפי הערך.",
    );
  }

  return warnings;
}

// ---------------------------------------------------------------------
// Manager voice - the tough-but-useful personal manager
// ---------------------------------------------------------------------

export interface DashboardStats {
  waitingForMe: number;
  hotLeads: number;
  followUpsToday: number;
  overdue: number;
  quoteRequests: number;
  moneyOnTable: number;
}

/** One sharp line for the top of the dashboard. */
export function dashboardManagerNote(stats: DashboardStats): string {
  if (stats.overdue > 0) {
    return `${stats.overdue} פולואפים כבר באיחור. זה לא נעלם כשמתעלמים — זה רק מתקרר. בואי נסגור אותם.`;
  }
  if (stats.hotLeads > 0 && stats.quoteRequests > 0) {
    return `יש ${stats.hotLeads} לידים חמים ו-${stats.quoteRequests} בקשות מחיר פתוחות. זו לא השבוע להפוך למסתורית.`;
  }
  if (stats.waitingForMe > 0) {
    return `${stats.waitingForMe} אנשים מחכים לתשובה ממך. הם לא יזכירו לך — זו העבודה שלי.`;
  }
  if (stats.followUpsToday > 0) {
    return `${stats.followUpsToday} פולואפים להיום. לא דחוף זה לא אומר לא חשוב. בואי נתקדם.`;
  }
  return "השולחן נקי. נצלי את זה כדי לייצר הזדמנות חדשה, לא כדי לנוח.";
}
