// =====================================================================
// gmailService - read incoming emails and create DRAFTS.
//
// Docs:
//   https://developers.google.com/workspace/gmail/api/guides
//   https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.drafts/create
//
// SAFETY: this module can create drafts. It NEVER sends email.
//         There is deliberately no "send" function here.
// =====================================================================

import type { EmailMessage } from "./types";
import { isDemoMode } from "./googleAuth";
import { mockEmails } from "./mockData";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

/** Search query used to surface likely opportunity emails. */
const OPPORTUNITY_QUERY =
  'in:inbox newer_than:30d (price OR proposal OR workshop OR לקיחת OR הרצאה OR סדנה OR ייעוץ OR "הצעת מחיר")';

export interface DraftInput {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
}

export interface DraftResult {
  draftId: string;
  message: string;
}

/**
 * List emails that look like business opportunities.
 * Demo mode -> mock inbox. Real mode -> Gmail API.
 */
export async function listOpportunityEmails(
  accessToken?: string,
): Promise<EmailMessage[]> {
  if (isDemoMode() || !accessToken) {
    return mockEmails;
  }

  // --- Phase 2: real Gmail read --------------------------------------
  const listRes = await fetch(
    `${GMAIL_API}/messages?q=${encodeURIComponent(OPPORTUNITY_QUERY)}&maxResults=25`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!listRes.ok) throw new Error(`Gmail list failed: ${listRes.status}`);
  const { messages = [] } = await listRes.json();

  const detailed = await Promise.all(
    messages.map((m: { id: string }) => getMessage(m.id, accessToken)),
  );
  return detailed.filter(Boolean) as EmailMessage[];
}

/** Fetch and normalize a single Gmail message. */
export async function getMessage(
  id: string,
  accessToken?: string,
): Promise<EmailMessage | null> {
  if (isDemoMode() || !accessToken) {
    return mockEmails.find((m) => m.id === id) ?? null;
  }

  const res = await fetch(`${GMAIL_API}/messages/${id}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();

  const headers: { name: string; value: string }[] =
    data.payload?.headers ?? [];
  const header = (n: string) =>
    headers.find((h) => h.name.toLowerCase() === n.toLowerCase())?.value ?? "";

  const from = header("from");
  const fromName = from.replace(/<.*>/, "").trim() || from;
  const fromEmail = (from.match(/<(.*)>/)?.[1] ?? from).trim();

  return {
    id: data.id,
    threadId: data.threadId,
    from: fromEmail,
    fromName,
    subject: header("subject"),
    snippet: data.snippet ?? "",
    body: decodeBody(data.payload),
    date: new Date(Number(data.internalDate)).toISOString().slice(0, 10),
    unread: (data.labelIds ?? []).includes("UNREAD"),
  };
}

/** Decode the plain-text body from a Gmail payload tree. */
function decodeBody(payload: unknown): string {
  const node = payload as {
    mimeType?: string;
    body?: { data?: string };
    parts?: unknown[];
  };
  if (!node) return "";
  if (node.mimeType === "text/plain" && node.body?.data) {
    return Buffer.from(node.body.data, "base64").toString("utf-8");
  }
  for (const part of node.parts ?? []) {
    const text = decodeBody(part);
    if (text) return text;
  }
  return "";
}

/**
 * Create a Gmail DRAFT. The draft sits in the user's Drafts folder
 * waiting for them to review and send manually. This never sends.
 */
export async function createDraft(
  input: DraftInput,
  accessToken?: string,
): Promise<DraftResult> {
  if (isDemoMode() || !accessToken) {
    return {
      draftId: `demo-draft-${Date.now()}`,
      message:
        "מצב דמו: הטיוטה הוכנה. בחיבור אמיתי ל-Gmail היא תישמר בתיקיית הטיוטות שלך — ולא תישלח.",
    };
  }

  // --- Phase 2: real draft creation ----------------------------------
  const raw = buildRawMessage(input);
  const res = await fetch(`${GMAIL_API}/drafts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: { raw, ...(input.threadId ? { threadId: input.threadId } : {}) },
    }),
  });
  if (!res.ok) throw new Error(`Draft creation failed: ${res.status}`);
  const data = await res.json();
  return {
    draftId: data.id,
    message: "הטיוטה נשמרה בתיקיית הטיוטות שלך ב-Gmail. לא נשלחה.",
  };
}

/** Build a base64url-encoded RFC 2822 message (UTF-8, Hebrew-safe). */
function buildRawMessage(input: DraftInput): string {
  const subject = `=?UTF-8?B?${Buffer.from(input.subject, "utf-8").toString(
    "base64",
  )}?=`;
  const lines = [
    `To: ${input.to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(input.body, "utf-8").toString("base64"),
  ];
  return Buffer.from(lines.join("\r\n"), "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
