// Calendar endpoint.
//   POST -> create a PRIVATE follow-up reminder (only after user approval
//           was already given in the UI).

import { NextRequest, NextResponse } from "next/server";
import { createReminderEvent } from "@/lib/calendarService";
import { getStoredAccessToken } from "@/lib/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.contactName || !body?.topic || !body?.date) {
      return NextResponse.json(
        { error: "contactName, topic and date are required" },
        { status: 400 },
      );
    }
    const result = await createReminderEvent(
      {
        contactName: body.contactName,
        topic: body.topic,
        date: body.date,
        context: body.context,
        suggestedNextStep: body.suggestedNextStep,
        previousPrice: body.previousPrice,
        contactProfileUrl: body.contactProfileUrl,
        gmailThreadUrl: body.gmailThreadUrl,
      },
      getStoredAccessToken(),
    );
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Calendar event failed" },
      { status: 500 },
    );
  }
}
