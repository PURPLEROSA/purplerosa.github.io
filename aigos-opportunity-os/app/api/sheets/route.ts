// Google Sheets endpoint.
//   GET           -> read a tab (?tab=Opportunities)
//   POST {schema} -> create the 6-tab database schema
//   POST {tab,row}-> append a row

import { NextRequest, NextResponse } from "next/server";
import {
  readTab,
  appendRow,
  createSpreadsheetSchema,
} from "@/lib/sheetsService";
import { getStoredAccessToken } from "@/lib/serverAuth";

export async function GET(req: NextRequest) {
  const tab = req.nextUrl.searchParams.get("tab") || "Opportunities";
  try {
    const rows = await readTab(tab, getStoredAccessToken());
    return NextResponse.json({ tab, rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sheets read failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = getStoredAccessToken();

    if (body?.schema) {
      const result = await createSpreadsheetSchema(token);
      return NextResponse.json(result);
    }

    if (body?.tab && Array.isArray(body?.row)) {
      await appendRow(body.tab, body.row, token);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Send { schema: true } or { tab, row }" },
      { status: 400 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sheets write failed" },
      { status: 500 },
    );
  }
}
