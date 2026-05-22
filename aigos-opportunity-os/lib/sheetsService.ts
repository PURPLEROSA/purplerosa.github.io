// =====================================================================
// sheetsService - Google Sheets as the database.
//
// Docs:
//   https://developers.google.com/workspace/sheets/api/guides/concepts
//   https://developers.google.com/workspace/sheets/api/reference/rest
//
// Phase 1: demo mode short-circuits everything.
// Phase 2: pass an access token + spreadsheet ID to talk to real Sheets.
// =====================================================================

import { isDemoMode } from "./googleAuth";
import { SHEET_TABS, DEFAULT_SETTINGS_ROWS } from "./sheetsSchema";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

function spreadsheetId(explicit?: string): string {
  const id = explicit || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!id) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID.");
  return id;
}

/** Read every row of a tab (first row is the header). */
export async function readTab(
  tabName: string,
  accessToken?: string,
  sheetId?: string,
): Promise<string[][]> {
  if (isDemoMode() || !accessToken) {
    return [];
  }
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId(sheetId)}/values/${encodeURIComponent(
      tabName,
    )}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error(`Sheets read failed: ${res.status}`);
  const data = await res.json();
  return data.values ?? [];
}

/** Append a single row to a tab. */
export async function appendRow(
  tabName: string,
  values: (string | number | boolean)[],
  accessToken?: string,
  sheetId?: string,
): Promise<void> {
  if (isDemoMode() || !accessToken) {
    return;
  }
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId(sheetId)}/values/${encodeURIComponent(
      tabName,
    )}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values] }),
    },
  );
  if (!res.ok) throw new Error(`Sheets append failed: ${res.status}`);
}

/** Overwrite a specific A1 range. */
export async function updateRange(
  range: string,
  values: (string | number | boolean)[][],
  accessToken?: string,
  sheetId?: string,
): Promise<void> {
  if (isDemoMode() || !accessToken) {
    return;
  }
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId(sheetId)}/values/${encodeURIComponent(
      range,
    )}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    },
  );
  if (!res.ok) throw new Error(`Sheets update failed: ${res.status}`);
}

export interface SchemaResult {
  ok: boolean;
  message: string;
  tabs: { name: string; columns: number }[];
}

/**
 * Create all six tabs and write their header rows.
 * Demo mode returns a description of what *would* be created.
 */
export async function createSpreadsheetSchema(
  accessToken?: string,
  sheetId?: string,
): Promise<SchemaResult> {
  const tabSummary = SHEET_TABS.map((t) => ({
    name: t.name,
    columns: t.columns.length,
  }));

  if (isDemoMode() || !accessToken) {
    return {
      ok: true,
      message:
        "מצב דמו: הסכמה מוכנה. בחיבור אמיתי ל-Google Sheets ייווצרו 6 הטאבים עם כל העמודות.",
      tabs: tabSummary,
    };
  }

  // --- Phase 2: real schema creation ---------------------------------
  const id = spreadsheetId(sheetId);

  // 1. Read which tabs already exist.
  const metaRes = await fetch(`${SHEETS_API}/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!metaRes.ok) throw new Error(`Sheets metadata failed: ${metaRes.status}`);
  const meta = await metaRes.json();
  const existing: string[] = (meta.sheets ?? []).map(
    (s: { properties: { title: string } }) => s.properties.title,
  );

  // 2. Add any missing tabs in one batch.
  const toCreate = SHEET_TABS.filter((t) => !existing.includes(t.name));
  if (toCreate.length > 0) {
    const batchRes = await fetch(`${SHEETS_API}/${id}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: toCreate.map((t) => ({
          addSheet: { properties: { title: t.name } },
        })),
      }),
    });
    if (!batchRes.ok) throw new Error(`Add sheets failed: ${batchRes.status}`);
  }

  // 3. Write header rows (and default Settings rows).
  for (const tab of SHEET_TABS) {
    const rows: string[][] = [tab.columns];
    if (tab.name === "Settings") rows.push(...DEFAULT_SETTINGS_ROWS);
    await updateRange(`${tab.name}!A1`, rows, accessToken, id);
  }

  return {
    ok: true,
    message: "נוצרו 6 הטאבים עם כל העמודות וכותרות. הגיליון מוכן לשימוש.",
    tabs: tabSummary,
  };
}
