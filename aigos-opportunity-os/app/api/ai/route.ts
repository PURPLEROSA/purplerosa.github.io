// AI endpoint.
//   POST {email}    -> classify a single email into an opportunity
//   POST {scanInbox}-> classify the whole (mock) inbox
//
// Phase 1 uses the rule-based classifier in lib/aiService.ts.
// Phase 2: route this to Gemini / Claude when an API key is present.

import { NextRequest, NextResponse } from "next/server";
import { classifyEmail, activeProvider } from "@/lib/aiService";
import { mockEmails } from "@/lib/mockData";
import type { EmailMessage } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body?.scanInbox) {
      const results = mockEmails.map((email) => ({
        emailId: email.id,
        classification: classifyEmail(email),
      }));
      return NextResponse.json({ provider: activeProvider(), results });
    }

    const email = body?.email as EmailMessage | undefined;
    if (!email?.subject && !email?.body) {
      return NextResponse.json(
        { error: "Provide an { email } object or { scanInbox: true }" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      provider: activeProvider(),
      classification: classifyEmail(email),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Classification failed" },
      { status: 500 },
    );
  }
}
