/* =============================================================
 * POST /api/ai — נקודת הקצה המרכזית ליכולות ה-AI
 * גוף הבקשה: { task: string, input: string, context?: string }
 * מחזיר AiResponse. ראו lib/ai/index.ts.
 * ============================================================= */

import { NextResponse } from "next/server";
import { runAiTask, hasLiveProvider } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      task?: string;
      input?: string;
      context?: string;
    };

    if (!body.task || !body.input) {
      return NextResponse.json(
        { error: "חסרים שדות חובה: task, input" },
        { status: 400 }
      );
    }

    const result = await runAiTask({
      task: body.task,
      input: body.input,
      context: body.context,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/ai] שגיאה:", err);
    return NextResponse.json(
      { error: "יצירת התוכן נכשלה. נסי שוב." },
      { status: 500 }
    );
  }
}

/** GET — בדיקת זמינות ספק ה-AI. */
export function GET() {
  return NextResponse.json({
    provider: hasLiveProvider() ? "live" : "mock",
    ready: true,
  });
}
