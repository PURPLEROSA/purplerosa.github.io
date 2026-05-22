/* =============================================================
 * SHELLY OG — מתאמי Google אמיתיים (Live Connectors)
 * -------------------------------------------------------------
 * מימוש חי של כל ה-connectors מעל חבילת googleapis + OAuth2.
 * מופעל רק כש-getConnectors() מזהה מצב "live" עם הרשאות תקפות.
 *
 * עקרון בטיחות: read-only / draft-only בלבד. המערכת לעולם לא
 * שולחת מייל, לא מוחקת ולא מזיזה קבצים. createDraft יוצר טיוטה.
 *
 * כל מתודה עטופה ב-try/catch — שגיאת API לעולם לא מפילה את האפליקציה.
 * ============================================================= */

import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import type { CalendarEvent } from "../mock-data";
import type { Opportunity, OpportunityType } from "../types";
import type {
  GmailConnector,
  DriveConnector,
  DocsConnector,
  SheetsConnector,
  CalendarConnector,
  GoogleConnectors,
  RawEmail,
  RawFile,
  RawDoc,
  RawSheetRow,
} from "./index";

/* ---------- בניית לקוח OAuth2 ---------- */

function buildOAuthClient(): OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return oauth2Client;
}

/* ---------- עזרי Gmail ---------- */

/** מחלץ ערך כותרת ממערך headers של הודעת Gmail. */
function headerValue(
  headers: { name?: string | null; value?: string | null }[] | undefined,
  name: string
): string {
  if (!headers) return "";
  const h = headers.find(
    (x) => (x.name ?? "").toLowerCase() === name.toLowerCase()
  );
  return h?.value ?? "";
}

/** בודק אם מייל נראה כניוזלטר. */
function looksLikeNewsletter(
  from: string,
  subject: string,
  hasUnsubscribe: boolean
): boolean {
  if (hasUnsubscribe) return true;
  const text = `${from} ${subject}`.toLowerCase();
  const hints = [
    "newsletter",
    "digest",
    "weekly",
    "daily",
    "ניוזלטר",
    "עדכון שבועי",
    "מהדורה",
    "rundown",
    "bites",
  ];
  return hints.some((h) => text.includes(h));
}

/** קידוד RFC 2822 ל-base64url עבור Gmail draft. */
function encodeMessage(to: string, subject: string, body: string): string {
  // נושא בעברית — מקודד כ-UTF-8 base64 לפי תקן MIME.
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString(
    "base64"
  )}?=`;
  const lines = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(body, "utf-8").toString("base64"),
  ];
  return Buffer.from(lines.join("\r\n"), "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/* ---------- סיווג הזדמנויות (Gmail) ---------- */

/** מילון מילות מפתח לכל סוג הזדמנות (עברית + אנגלית). */
const OPPORTUNITY_KEYWORDS: { type: OpportunityType; words: string[] }[] = [
  {
    type: "lecture-invite",
    words: [
      "הרצאה",
      "מליאה",
      "כנס",
      "וובינר",
      "lecture",
      "keynote",
      "speaker",
      "talk",
      "webinar",
      "conference",
    ],
  },
  {
    type: "collaboration",
    words: [
      "שיתוף פעולה",
      "שת״פ",
      "שיתוף",
      "collab",
      "collaboration",
      "partnership",
      "partner",
    ],
  },
  {
    type: "job-offer",
    words: [
      "הצעת עבודה",
      "משרה",
      "גיוס",
      "job",
      "position",
      "hiring",
      "recruit",
      "vacancy",
    ],
  },
  {
    type: "quote-request",
    words: [
      "הצעת מחיר",
      "תמחור",
      "הצעה כספית",
      "quote",
      "pricing",
      "proposal",
      "estimate",
    ],
  },
  {
    type: "client-inquiry",
    words: [
      "פנייה",
      "לקוח",
      "ליווי",
      "ייעוץ",
      "סדנה",
      "client",
      "inquiry",
      "consulting",
      "workshop",
      "service",
    ],
  },
  {
    type: "ai-tool-update",
    words: [
      "כלי",
      "עדכון",
      "release",
      "launch",
      "update",
      "feature",
      "ai tool",
      "model",
    ],
  },
  {
    type: "follow-up",
    words: [
      "פולואפ",
      "מעקב",
      "תזכורת",
      "follow up",
      "follow-up",
      "followup",
      "reminder",
      "reply needed",
    ],
  },
  {
    type: "task",
    words: ["משימה", "לבצע", "deadline", "task", "to do", "action item"],
  },
  {
    type: "important-newsletter",
    words: ["newsletter", "digest", "ניוזלטר", "מהדורה", "weekly", "rundown"],
  },
];

/** מסווג מייל לסוג הזדמנות לפי מילות מפתח. */
function classifyOpportunity(subject: string, snippet: string): OpportunityType {
  const text = `${subject} ${snippet}`.toLowerCase();
  for (const entry of OPPORTUNITY_KEYWORDS) {
    if (entry.words.some((w) => text.includes(w.toLowerCase()))) {
      return entry.type;
    }
  }
  return "follow-up";
}

/* =============================================================
 * Gmail Connector
 * ============================================================= */

function buildGmailConnector(auth: OAuth2Client): GmailConnector {
  const gmail = google.gmail({ version: "v1", auth });

  return {
    async listRelevantEmails(): Promise<RawEmail[]> {
      try {
        const list = await gmail.users.messages.list({
          userId: "me",
          q: "newer_than:14d",
          maxResults: 20,
        });
        const messages = list.data.messages ?? [];
        const emails: RawEmail[] = [];
        for (const msg of messages) {
          if (!msg.id) continue;
          try {
            const full = await gmail.users.messages.get({
              userId: "me",
              id: msg.id,
              format: "metadata",
              metadataHeaders: [
                "Subject",
                "From",
                "Date",
                "List-Unsubscribe",
              ],
            });
            const headers = full.data.payload?.headers ?? undefined;
            const subject = headerValue(headers, "Subject") || "(ללא נושא)";
            const from = headerValue(headers, "From") || "(לא ידוע)";
            const dateRaw = headerValue(headers, "Date");
            const hasUnsubscribe = !!headerValue(headers, "List-Unsubscribe");
            const receivedAt = dateRaw
              ? new Date(dateRaw).toISOString()
              : full.data.internalDate
                ? new Date(Number(full.data.internalDate)).toISOString()
                : new Date().toISOString();
            emails.push({
              id: msg.id,
              subject,
              from,
              snippet: full.data.snippet ?? "",
              receivedAt,
              isNewsletter: looksLikeNewsletter(from, subject, hasUnsubscribe),
              url: `https://mail.google.com/mail/u/0/#all/${msg.id}`,
            });
          } catch (innerErr) {
            console.error("[google/live] gmail.get נכשל להודעה:", innerErr);
          }
        }
        return emails;
      } catch (err) {
        console.error("[google/live] listRelevantEmails נכשל:", err);
        return [];
      }
    },

    async detectOpportunities(): Promise<Opportunity[]> {
      try {
        const list = await gmail.users.messages.list({
          userId: "me",
          q: "newer_than:14d",
          maxResults: 15,
        });
        const messages = list.data.messages ?? [];
        const opportunities: Opportunity[] = [];
        for (const msg of messages) {
          if (!msg.id) continue;
          try {
            const full = await gmail.users.messages.get({
              userId: "me",
              id: msg.id,
              format: "metadata",
              metadataHeaders: ["Subject", "From", "Date"],
            });
            const headers = full.data.payload?.headers ?? undefined;
            const subject = headerValue(headers, "Subject") || "(ללא נושא)";
            const from = headerValue(headers, "From") || "(לא ידוע)";
            const dateRaw = headerValue(headers, "Date");
            const snippet = full.data.snippet ?? "";
            const createdAt = dateRaw
              ? new Date(dateRaw).toISOString()
              : full.data.internalDate
                ? new Date(Number(full.data.internalDate)).toISOString()
                : new Date().toISOString();
            const type = classifyOpportunity(subject, snippet);
            opportunities.push({
              id: `opp_${msg.id}`,
              source: "gmail",
              title: subject,
              from,
              summary: snippet || "מייל שזוהה כהזדמנות אפשרית.",
              type,
              importance: "medium",
              urgency: "medium",
              recommendedAction:
                "לעבור על המייל ולהחליט אם להגיב, לשמור לפרויקט או להפוך לתוכן.",
              shouldDraftReply: false,
              shouldTurnIntoContent: false,
              shouldSaveToProject: false,
              shouldCreateReminder: false,
              status: "new",
              relatedProjectId: null,
              createdAt,
            });
          } catch (innerErr) {
            console.error(
              "[google/live] detectOpportunities — gmail.get נכשל:",
              innerErr
            );
          }
        }
        return opportunities;
      } catch (err) {
        console.error("[google/live] detectOpportunities נכשל:", err);
        return [];
      }
    },

    async createDraft(
      to: string,
      subject: string,
      body: string
    ): Promise<{ draftId: string }> {
      try {
        const raw = encodeMessage(to, subject, body);
        const res = await gmail.users.drafts.create({
          userId: "me",
          requestBody: { message: { raw } },
        });
        return { draftId: res.data.id ?? `draft_unknown_${Date.now()}` };
      } catch (err) {
        console.error("[google/live] createDraft נכשל:", err);
        return { draftId: `draft_error_${Date.now()}` };
      }
    },
  };
}

/* =============================================================
 * Drive Connector
 * ============================================================= */

/** ממיר שם קובץ לצורה מנורמלת להשוואת כפילויות. */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "") // הסרת סיומת
    .replace(/\b(copy|עותק|עותק של|final|סופי|ישן|old|\d+)\b/g, "")
    .replace(/[-_\s—]+/g, " ")
    .trim();
}

function buildDriveConnector(auth: OAuth2Client): DriveConnector {
  const drive = google.drive({ version: "v3", auth });

  async function fetchFiles(): Promise<RawFile[]> {
    const res = await drive.files.list({
      pageSize: 25,
      fields:
        "files(id,name,mimeType,modifiedTime,size,parents,webViewLink)",
      orderBy: "modifiedTime desc",
    });
    const files = res.data.files ?? [];
    return files.map((f) => ({
      id: f.id ?? "",
      name: f.name ?? "(ללא שם)",
      mimeType: f.mimeType ?? "application/octet-stream",
      folder: f.parents && f.parents.length > 0 ? f.parents[0] : "—",
      modifiedAt: f.modifiedTime ?? new Date().toISOString(),
      sizeKb: f.size ? Math.round(Number(f.size) / 1024) : 0,
      url:
        f.webViewLink ??
        `https://drive.google.com/file/d/${f.id ?? ""}/view`,
    }));
  }

  return {
    async listFiles(): Promise<RawFile[]> {
      try {
        return await fetchFiles();
      } catch (err) {
        console.error("[google/live] listFiles נכשל:", err);
        return [];
      }
    },

    async suggestFolderStructure() {
      // המלצה סטטית בלבד — זהה ל-Mock. ייעוץ, ללא ביצוע.
      return [
        { folder: "הרצאות", rationale: "כל חומרי ההרצאות במקום אחד — קל למחזור." },
        {
          folder: "סדרות תוכן",
          rationale: "כל סדרה בתיקייה — שומר על עקביות הפקה.",
        },
        {
          folder: "נכסים פעילים",
          rationale: "פרומפטים, הוקים ותבניות בשימוש שוטף.",
        },
        {
          folder: "ארכיון למחזור",
          rationale: "תוכן ישן בעל ערך שמחכה לרענון.",
        },
      ];
    },

    async detectDuplicates() {
      try {
        const files = await fetchFiles();
        const pairs: { fileA: string; fileB: string; confidence: number }[] = [];
        for (let i = 0; i < files.length; i++) {
          for (let j = i + 1; j < files.length; j++) {
            const a = files[i];
            const b = files[j];
            const nameAEqual =
              a.name.toLowerCase() === b.name.toLowerCase();
            const normEqual =
              normalizeName(a.name) !== "" &&
              normalizeName(a.name) === normalizeName(b.name);
            if (nameAEqual) {
              pairs.push({ fileA: a.name, fileB: b.name, confidence: 0.98 });
            } else if (normEqual) {
              pairs.push({ fileA: a.name, fileB: b.name, confidence: 0.85 });
            }
          }
        }
        return pairs;
      } catch (err) {
        console.error("[google/live] detectDuplicates נכשל:", err);
        return [];
      }
    },
  };
}

/* =============================================================
 * Docs Connector
 * ============================================================= */

function buildDocsConnector(auth: OAuth2Client): DocsConnector {
  const drive = google.drive({ version: "v3", auth });

  return {
    async listDocs(): Promise<RawDoc[]> {
      try {
        const res = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.document'",
          pageSize: 25,
          fields: "files(id,name,webViewLink)",
          orderBy: "modifiedTime desc",
        });
        const files = res.data.files ?? [];
        return files.map((f) => ({
          id: f.id ?? "",
          title: f.name ?? "(ללא כותרת)",
          excerpt: "",
          url:
            f.webViewLink ??
            `https://docs.google.com/document/d/${f.id ?? ""}/edit`,
        }));
      } catch (err) {
        console.error("[google/live] listDocs נכשל:", err);
        return [];
      }
    },
  };
}

/* =============================================================
 * Sheets Connector
 * ============================================================= */

function buildSheetsConnector(auth: OAuth2Client): SheetsConnector {
  const sheets = google.sheets({ version: "v4", auth });

  return {
    async readSheet(sheetId: string): Promise<RawSheetRow[]> {
      try {
        const res = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: "A1:Z1000",
        });
        const rows = res.data.values ?? [];
        return rows.map((row, index) => ({
          rowIndex: index + 1,
          values: (row as unknown[]).map((cell) =>
            cell === null || cell === undefined ? "" : String(cell)
          ),
        }));
      } catch (err) {
        console.error("[google/live] readSheet נכשל:", err);
        return [];
      }
    },
  };
}

/* =============================================================
 * Calendar Connector
 * ============================================================= */

/** ניחוש סוג אירוע יומן לפי מילות מפתח בכותרת. */
function guessEventType(summary: string): CalendarEvent["type"] {
  const text = summary.toLowerCase();
  if (
    text.includes("הרצאה") ||
    text.includes("כנס") ||
    text.includes("lecture") ||
    text.includes("keynote") ||
    text.includes("talk")
  ) {
    return "lecture";
  }
  if (
    text.includes("צילום") ||
    text.includes("הקלטה") ||
    text.includes("shoot") ||
    text.includes("recording")
  ) {
    return "shoot";
  }
  if (
    text.includes("דדליין") ||
    text.includes("deadline") ||
    text.includes("מסירה")
  ) {
    return "deadline";
  }
  if (
    text.includes("פרסום") ||
    text.includes("publish") ||
    text.includes("העלאה")
  ) {
    return "publish";
  }
  return "meeting";
}

function buildCalendarConnector(auth: OAuth2Client): CalendarConnector {
  const calendar = google.calendar({ version: "v3", auth });

  return {
    async listEvents(): Promise<CalendarEvent[]> {
      try {
        const res = await calendar.events.list({
          calendarId: "primary",
          timeMin: new Date().toISOString(),
          maxResults: 20,
          singleEvents: true,
          orderBy: "startTime",
        });
        const events = res.data.items ?? [];
        return events.map((e) => {
          const summary = e.summary ?? "(אירוע ללא כותרת)";
          const date =
            e.start?.dateTime ?? e.start?.date ?? new Date().toISOString();
          return {
            id: e.id ?? `cal_${Math.random().toString(36).slice(2)}`,
            title: summary,
            date,
            type: guessEventType(summary),
            relatedProjectId: null,
            url: e.htmlLink ?? undefined,
          };
        });
      } catch (err) {
        console.error("[google/live] listEvents נכשל:", err);
        return [];
      }
    },
  };
}

/* =============================================================
 * Factory — בניית כל ה-Live connectors
 * ============================================================= */

export function buildLiveConnectors(): GoogleConnectors {
  const auth = buildOAuthClient();
  return {
    gmail: buildGmailConnector(auth),
    drive: buildDriveConnector(auth),
    docs: buildDocsConnector(auth),
    sheets: buildSheetsConnector(auth),
    calendar: buildCalendarConnector(auth),
  };
}
