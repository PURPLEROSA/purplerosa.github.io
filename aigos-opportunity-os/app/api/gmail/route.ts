// Gmail endpoint.
//   GET  -> list likely opportunity emails
//   POST -> create a DRAFT (never sends)

import { NextRequest, NextResponse } from "next/server";
import { listOpportunityEmails, createDraft } from "@/lib/gmailService";
import { getStoredAccessToken } from "@/lib/serverAuth";

export async function GET() {
  try {
    const emails = await listOpportunityEmails(getStoredAccessToken());
    return NextResponse.json({ emails });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gmail read failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.to || !body?.subject || !body?.body) {
      return NextResponse.json(
        { error: "to, subject and body are required" },
        { status: 400 },
      );
    }
    const result = await createDraft(
      {
        to: body.to,
        subject: body.subject,
        body: body.body,
        threadId: body.threadId,
      },
      getStoredAccessToken(),
    );
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Draft creation failed" },
      { status: 500 },
    );
  }
}
