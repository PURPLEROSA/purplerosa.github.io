// Starts the Google OAuth flow by redirecting to the consent screen.
// Docs: https://developers.google.com/identity/protocols/oauth2/web-server

import { NextResponse } from "next/server";
import { getAuthUrl, isDemoMode } from "@/lib/googleAuth";

export function GET() {
  if (isDemoMode()) {
    return NextResponse.json({
      demoMode: true,
      message:
        "המערכת במצב דמו. כדי להתחבר באמת — מלאי את GOOGLE_CLIENT_ID ו-GOOGLE_CLIENT_SECRET ב-.env.local וכבי את מצב הדמו.",
    });
  }

  try {
    return NextResponse.redirect(getAuthUrl());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OAuth init failed" },
      { status: 500 },
    );
  }
}
