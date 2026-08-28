// Handles the OAuth redirect: exchanges the code for tokens and stores
// them in an httpOnly cookie.

import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, isDemoMode } from "@/lib/googleAuth";
import { TOKEN_COOKIE } from "@/lib/serverAuth";

export async function GET(req: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json({
      demoMode: true,
      message: "מצב דמו פעיל — אין מה לקלוט מ-OAuth.",
    });
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/setup?auth=denied", req.url));
  }
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const res = NextResponse.redirect(new URL("/setup?auth=ok", req.url));
    res.cookies.set(TOKEN_COOKIE, JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Token exchange failed" },
      { status: 500 },
    );
  }
}
