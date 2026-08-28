// =====================================================================
// calendarService - create PRIVATE follow-up reminders.
//
// Docs:
//   https://developers.google.com/workspace/calendar/api/guides/overview
//   https://developers.google.com/workspace/calendar/api/guides/create-events
//
// SAFETY:
//   - An event is created ONLY after explicit user approval.
//   - The event is a private reminder. The client is NEVER invited.
// =====================================================================

import { isDemoMode } from "./googleAuth";

const CALENDAR_API =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export interface ReminderInput {
  contactName: string;
  topic: string;
  date: string; // YYYY-MM-DD
  context?: string;
  lastInteractionSummary?: string;
  suggestedNextStep?: string;
  previousPrice?: string;
  contactProfileUrl?: string;
  gmailThreadUrl?: string;
}

export interface ReminderResult {
  eventId: string;
  message: string;
}

/** Build the title: "Follow up: [Contact] — [Topic]". */
export function reminderTitle(input: ReminderInput): string {
  return `Follow up: ${input.contactName} — ${input.topic}`;
}

/** Build the private reminder description body. */
export function reminderDescription(input: ReminderInput): string {
  const lines: string[] = [];
  if (input.context) lines.push(`הקשר: ${input.context}`);
  if (input.lastInteractionSummary)
    lines.push(`אינטראקציה אחרונה: ${input.lastInteractionSummary}`);
  if (input.suggestedNextStep)
    lines.push(`צעד מוצע: ${input.suggestedNextStep}`);
  if (input.previousPrice) lines.push(`מחיר קודם: ${input.previousPrice}`);
  if (input.contactProfileUrl)
    lines.push(`כרטיס איש קשר: ${input.contactProfileUrl}`);
  if (input.gmailThreadUrl)
    lines.push(`שרשור Gmail: ${input.gmailThreadUrl}`);
  lines.push("");
  lines.push("— תזכורת פרטית מ-AI.GOS Opportunity OS. הלקוח/ה לא הוזמן/ה.");
  return lines.join("\n");
}

/**
 * Create a private all-day reminder event.
 * Demo mode returns a fake event id and explains what would happen.
 */
export async function createReminderEvent(
  input: ReminderInput,
  accessToken?: string,
): Promise<ReminderResult> {
  if (isDemoMode() || !accessToken) {
    return {
      eventId: `demo-event-${Date.now()}`,
      message:
        "מצב דמו: התזכורת מוכנה. בחיבור אמיתי ל-Google Calendar תיווצר תזכורת פרטית ביומן שלך בלבד.",
    };
  }

  // --- Phase 2: real event creation ----------------------------------
  const res = await fetch(CALENDAR_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: reminderTitle(input),
      description: reminderDescription(input),
      // All-day event => no attendees => stays private to the user.
      start: { date: input.date },
      end: { date: input.date },
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 9 * 60 }],
      },
      transparency: "transparent",
      visibility: "private",
    }),
  });
  if (!res.ok) throw new Error(`Calendar event failed: ${res.status}`);
  const data = await res.json();
  return {
    eventId: data.id,
    message: "נוצרה תזכורת פרטית ביומן שלך. הלקוח/ה לא הוזמן/ה.",
  };
}
