/* =============================================================
 * SHELLY OG — שכבת ה-AI (Dispatcher)
 * נקודת כניסה אחת לכל יכולות ה-AI במערכת:
 * סיווג, ניקוד, יצירת תוכן, ניתוח טרנדים, המלצות.
 *
 * ברירת מחדל: מנוע Mock (lib/ai/mock-ai.ts) — לא דורש מפתח.
 * אם הוגדר מפתח API אמיתי — נשתמש בספק החי.
 * ============================================================= */

import type { AiRequest, AiResponse } from "./types";
import { runMockAi } from "./mock-ai";

export type { AiRequest, AiResponse, AiSection, ViralAngle } from "./types";

/** האם קיים מפתח לספק AI חי. */
export function hasLiveProvider(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY);
}

/** מערכת ההנחיה הקבועה — הקול של Shelly. */
const SYSTEM_PROMPT = `את עוזרת תוכן בכירה של Shelly Or Gisser — יוצרת AI, מרצה ו-Head of AI.
כתבי תמיד בעברית, בלשון נקבה, RTL.
הקול: חכם, ישיר, בטוח, אנושי, מקצועי, לא רובוטי, לא גנרי, עם קריצה קטנה, בלי להגזים.
הימנעי מניסוחי AI גנריים. תני ערך אמיתי. דחפי לפרסום.`;

/**
 * מריץ משימת AI.
 * ----------------------------------------------------------------
 * חיבור אמיתי: כשיוגדר ANTHROPIC_API_KEY, הקריאה ל-callAnthropic
 * מתבצעת מול ה-API. כרגע, ללא מפתח, חוזרים למנוע ה-Mock.
 * ---------------------------------------------------------------- */
export async function runAiTask(req: AiRequest): Promise<AiResponse> {
  if (process.env.ANTHROPIC_API_KEY && process.env.AI_PROVIDER !== "openai") {
    try {
      return await callAnthropic(req);
    } catch (err) {
      console.error("[SHELLY OG] קריאת Anthropic נכשלה, חוזרים ל-Mock:", err);
      return { ...runMockAi(req), note: "ספק AI לא זמין — הופעל מנוע Mock." };
    }
  }
  // ברירת מחדל בטוחה — מנוע Mock מלא.
  return runMockAi(req);
}

/* =============================================================
 * חיבור אמיתי ל-Anthropic Claude
 * -------------------------------------------------------------
 * הפונקציה מוכנה לשימוש. ברגע שיוגדר ANTHROPIC_API_KEY ב-.env.local
 * היא תיקרא אוטומטית. מומלץ הדגם claude-sonnet-4-6 לאיזון מהירות/איכות.
 * ============================================================= */
async function callAnthropic(req: AiRequest): Promise<AiResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY as string;

  const userPrompt = buildUserPrompt(req);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text: string }[];
  };
  const text = data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n")
    .trim();

  // משימות מובנות (camera/viral/trend) ממופות חזרה דרך ה-Mock
  // כדי לשמור על מבנה אחיד ב-UI. הטקסט החי משמש כפלט הראשי.
  const mock = runMockAi(req);
  if (mock.sections || mock.angles) {
    return { ...mock, provider: "anthropic", text };
  }
  return { task: req.task, provider: "anthropic", text };
}

/** בונה את הנחיית המשתמשת לפי סוג המשימה. */
function buildUserPrompt(req: AiRequest): string {
  const ctx = req.context ? `\nהקשר נוסף: ${req.context}` : "";
  return `משימה: ${req.task}
נושא / טקסט מקור: ${req.input}${ctx}

הפיקי פלט מוכן לשימוש, בעברית, בקול של Shelly. בלי הקדמות מיותרות.`;
}

/* ---------- כלי עזר סינכרוניים (משמשים API routes) ---------- */

export { runMockAi } from "./mock-ai";
