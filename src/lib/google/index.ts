/* =============================================================
 * SHELLY OG — שכבת מתאמים ל-Google Workspace
 * -------------------------------------------------------------
 * כאן מוגדרים ה-interfaces הנקיים לכל חיבור Google, לצד מימוש
 * Mock מלא שמאפשר להריץ ולהדגים את כל המוצר ללא הרשאות אמיתיות.
 *
 * חיבור אמיתי (ראו README › "חיבור Google אמיתי"):
 *   1. צרי פרויקט ב-Google Cloud והפעילי את ה-APIs.
 *   2. מלאי GOOGLE_CLIENT_ID / SECRET / REFRESH_TOKEN ב-.env.local.
 *   3. החליפי את getConnectors() כך שיחזיר את ה-Live connectors.
 *
 * עקרון בטיחות: המתאמים האלה הם read-only / draft-only בלבד.
 * המערכת לעולם לא שולחת מייל, לא מוחקת ולא מזיזה קבצים אוטומטית.
 * ============================================================= */

import {
  mockOpportunities,
  mockCalendarEvents,
  type CalendarEvent,
} from "../mock-data";
import type { Opportunity } from "../types";

/** מצב הנתונים הנוכחי — נקבע ע"י משתני סביבה. */
export function dataMode(): "mock" | "live" {
  const hasGoogle =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN;
  if (process.env.SHELLY_DATA_MODE === "live" && hasGoogle) return "live";
  return "mock";
}

/* ---------- טיפוסי תוצאה ---------- */

export interface RawEmail {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  receivedAt: string;
  isNewsletter: boolean;
}

export interface RawFile {
  id: string;
  name: string;
  mimeType: string;
  folder: string;
  modifiedAt: string;
  sizeKb: number;
}

export interface RawDoc {
  id: string;
  title: string;
  excerpt: string;
}

export interface RawSheetRow {
  rowIndex: number;
  values: string[];
}

/** פריט גולמי שהוחזר מסריקה — חומר גלם לטרנד / רעיון. */
export interface ScannedItem {
  id: string;
  source: "gmail" | "drive" | "docs" | "sheets" | "calendar" | "saved-link";
  title: string;
  snippet: string;
  capturedAt: string;
}

/* =============================================================
 * Interfaces — חוזה אחיד לכל connector
 * ============================================================= */

export interface GmailConnector {
  /** ניוזלטרים ומיילים רלוונטיים לרדאר הטרנדים. */
  listRelevantEmails(): Promise<RawEmail[]>;
  /** זיהוי הזדמנויות (הזמנות, פניות, שת"פים). */
  detectOpportunities(): Promise<Opportunity[]>;
  /**
   * יצירת טיוטת מענה — לעולם לא נשלח אוטומטית.
   * חיבור אמיתי: gmail.users.drafts.create
   */
  createDraft(to: string, subject: string, body: string): Promise<{ draftId: string }>;
}

export interface DriveConnector {
  listFiles(): Promise<RawFile[]>;
  /** הצעת מבנה תיקיות — המלצה בלבד, ללא ביצוע. */
  suggestFolderStructure(): Promise<{ folder: string; rationale: string }[]>;
  /** זיהוי כפילויות אפשריות — דורש אישור לפני כל פעולה. */
  detectDuplicates(): Promise<{ fileA: string; fileB: string; confidence: number }[]>;
}

export interface DocsConnector {
  listDocs(): Promise<RawDoc[]>;
}

export interface SheetsConnector {
  readSheet(sheetId: string): Promise<RawSheetRow[]>;
}

export interface CalendarConnector {
  listEvents(): Promise<CalendarEvent[]>;
}

export interface GoogleConnectors {
  gmail: GmailConnector;
  drive: DriveConnector;
  docs: DocsConnector;
  sheets: SheetsConnector;
  calendar: CalendarConnector;
}

/* =============================================================
 * מימוש Mock — מאפשר להריץ את כל המוצר מיד
 * ============================================================= */

const mockGmail: GmailConnector = {
  async listRelevantEmails() {
    return [
      {
        id: "em_1",
        subject: "The Rundown AI — מודלי וידאו חדשים משנים את המשחק",
        from: "The Rundown AI",
        snippet:
          "כמה ספקיות הכריזו על מודלי וידאו שמייצרים סצנות ארוכות ועקביות ממשפט בודד…",
        receivedAt: "2026-05-22T06:30:00Z",
        isNewsletter: true,
      },
      {
        id: "em_2",
        subject: "Ben's Bites — סוכני AI נכנסים לכל אפליקציה",
        from: "Ben's Bites",
        snippet: "פלטפורמות עבודה משלבות סוכנים אוטונומיים שמבצעים משימות רב-שלביות…",
        receivedAt: "2026-05-21T07:00:00Z",
        isNewsletter: true,
      },
      {
        id: "em_3",
        subject: "הזמנה להרצאת מליאה — כנס חדשנות שיווק",
        from: "ועדת תוכן — Innovation Summit",
        snippet: "נשמח שתרצי במליאה בת 40 דקות מול כ-500 משתתפים…",
        receivedAt: "2026-05-21T08:30:00Z",
        isNewsletter: false,
      },
    ];
  },
  async detectOpportunities() {
    return mockOpportunities;
  },
  async createDraft(to, subject) {
    // חיבור אמיתי: gmail.users.drafts.create — יוצר טיוטה בלבד.
    return { draftId: `draft_mock_${Date.now()}` };
  },
};

const mockDrive: DriveConnector = {
  async listFiles() {
    return [
      {
        id: "f_1",
        name: "מצגת — AI שמוכר טיוטה 3.pptx",
        mimeType: "presentation",
        folder: "הרצאות / AI שמוכר",
        modifiedAt: "2026-05-20T11:00:00Z",
        sizeKb: 8200,
      },
      {
        id: "f_2",
        name: "הקלטת וובינר אוטומציה 2025.mp4",
        mimeType: "video",
        folder: "ארכיון",
        modifiedAt: "2025-11-18T10:00:00Z",
        sizeKb: 240000,
      },
      {
        id: "f_3",
        name: "מאגר הוקים.docx",
        mimeType: "document",
        folder: "נכסים",
        modifiedAt: "2026-03-30T10:00:00Z",
        sizeKb: 64,
      },
      {
        id: "f_4",
        name: "מאגר הוקים — עותק.docx",
        mimeType: "document",
        folder: "ישן",
        modifiedAt: "2026-01-20T10:00:00Z",
        sizeKb: 61,
      },
    ];
  },
  async suggestFolderStructure() {
    return [
      { folder: "הרצאות", rationale: "כל חומרי ההרצאות במקום אחד — קל למחזור." },
      { folder: "סדרות תוכן", rationale: "כל סדרה בתיקייה — שומר על עקביות הפקה." },
      { folder: "נכסים פעילים", rationale: "פרומפטים, הוקים ותבניות בשימוש שוטף." },
      { folder: "ארכיון למחזור", rationale: "תוכן ישן בעל ערך שמחכה לרענון." },
    ];
  },
  async detectDuplicates() {
    return [
      { fileA: "מאגר הוקים.docx", fileB: "מאגר הוקים — עותק.docx", confidence: 0.93 },
    ];
  },
};

const mockDocs: DocsConnector = {
  async listDocs() {
    return [
      {
        id: "d_1",
        title: "הערות מחקר — כלי מסך-לקוד",
        excerpt: "כלי שממיר עיצוב סטטי לקוד עובד. פחות רלוונטי לקהל הליבה.",
      },
      {
        id: "d_2",
        title: "מסמך מיצוב ונרטיב",
        excerpt: "Shelly = הכתובת מספר 1 בעברית להבנת AI קריאייטיב.",
      },
    ];
  },
};

const mockSheets: SheetsConnector = {
  async readSheet() {
    return [
      { rowIndex: 1, values: ["רעיון", "פלטפורמה", "סטטוס"] },
      { rowIndex: 2, values: ["שכבות בפרומפט", "רילס", "טיוטה"] },
      { rowIndex: 3, values: ["עקביות דמות בתמונות", "קרוסלה", "רעיון"] },
    ];
  },
};

const mockCalendar: CalendarConnector = {
  async listEvents() {
    return mockCalendarEvents;
  },
};

const mockConnectors: GoogleConnectors = {
  gmail: mockGmail,
  drive: mockDrive,
  docs: mockDocs,
  sheets: mockSheets,
  calendar: mockCalendar,
};

/* =============================================================
 * Factory — מחזיר את ה-connectors המתאימים למצב הנוכחי
 * ============================================================= */

export function getConnectors(): GoogleConnectors {
  if (dataMode() === "live") {
    // ----------------------------------------------------------
    // חיבור אמיתי: כאן יוחזרו ה-Live connectors שמשתמשים ב-googleapis.
    // לדוגמה:
    //   const auth = new google.auth.OAuth2(CLIENT_ID, SECRET, REDIRECT);
    //   auth.setCredentials({ refresh_token: REFRESH_TOKEN });
    //   return buildLiveConnectors(auth);
    // עד למימוש המלא — חוזרים ל-Mock כדי לא לשבור את האפליקציה.
    // ----------------------------------------------------------
    console.warn("[SHELLY OG] מצב live התבקש אך ה-Live connectors טרם מומשו — Mock.");
  }
  return mockConnectors;
}
