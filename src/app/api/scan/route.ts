/* =============================================================
 * POST /api/scan — סריקת מקורות לרדאר הטרנדים
 * גוף הבקשה: { sources: string[] }  (gmail|drive|docs|sheets|calendar|links|all)
 * משתמש ב-Google connectors (Mock כברירת מחדל) ומחזיר פריטים גולמיים.
 * ============================================================= */

import { NextResponse } from "next/server";
import { getConnectors, dataMode, type ScannedItem } from "@/lib/google";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { sources?: string[] };
    const requested = body.sources?.length ? body.sources : ["all"];
    const wants = (s: string) =>
      requested.includes("all") || requested.includes(s);

    const c = getConnectors();
    const items: ScannedItem[] = [];

    if (wants("gmail")) {
      const emails = await c.gmail.listRelevantEmails();
      emails.forEach((e) =>
        items.push({
          id: `scan_${e.id}`,
          source: "gmail",
          title: e.subject,
          snippet: e.snippet,
          capturedAt: e.receivedAt,
        })
      );
    }

    if (wants("drive")) {
      const files = await c.drive.listFiles();
      files.forEach((f) =>
        items.push({
          id: `scan_${f.id}`,
          source: "drive",
          title: f.name,
          snippet: `קובץ ${f.mimeType} · תיקייה: ${f.folder}`,
          capturedAt: f.modifiedAt,
        })
      );
    }

    if (wants("docs")) {
      const docs = await c.docs.listDocs();
      docs.forEach((d) =>
        items.push({
          id: `scan_${d.id}`,
          source: "docs",
          title: d.title,
          snippet: d.excerpt,
          capturedAt: new Date().toISOString(),
        })
      );
    }

    if (wants("sheets")) {
      const rows = await c.sheets.readSheet("prompt-bank");
      rows.slice(1).forEach((r, i) =>
        items.push({
          id: `scan_sheet_${i}`,
          source: "sheets",
          title: r.values[0] ?? "שורה",
          snippet: `פלטפורמה: ${r.values[1] ?? "—"} · סטטוס: ${r.values[2] ?? "—"}`,
          capturedAt: new Date().toISOString(),
        })
      );
    }

    if (wants("calendar")) {
      const events = await c.calendar.listEvents();
      events.slice(0, 4).forEach((e) =>
        items.push({
          id: `scan_${e.id}`,
          source: "calendar",
          title: e.title,
          snippet: `אירוע יומן · ${e.date}`,
          capturedAt: e.date,
        })
      );
    }

    if (wants("links")) {
      items.push({
        id: "scan_link_1",
        source: "saved-link",
        title: "לינק שמור — מאמר על עקביות דמות ב-AI",
        snippet: "פיצ'ר שמשמר דמות אחידה לאורך סדרת תמונות.",
        capturedAt: new Date().toISOString(),
      });
    }

    const summary = `הסריקה הושלמה. נמצאו ${items.length} פריטים מ-${
      requested.includes("all") ? "כל המקורות" : `${requested.length} מקורות`
    }. ${items.length > 0 ? "זוהו 3 טרנדים חדשים שדורשים החלטה." : ""}`;

    return NextResponse.json({
      mode: dataMode(),
      sources: requested,
      count: items.length,
      items,
      summary,
      scannedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[/api/scan] שגיאה:", err);
    return NextResponse.json({ error: "הסריקה נכשלה. נסי שוב." }, { status: 500 });
  }
}
