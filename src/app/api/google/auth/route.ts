/* =============================================================
 * GET /api/google/auth — התחלת זרימת OAuth של Google
 * בונה כתובת הסכמה (consent) ומפנה את שלי אליה.
 * אחרי האישור — Google מחזירה ל-/api/google/callback.
 * ============================================================= */

import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

/** היקפי ההרשאה הנדרשים — read-only + יצירת טיוטות בלבד. */
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];

/** עמוד שגיאה בעברית כשחסרות הרשאות OAuth. */
function missingCredentialsPage(): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SHELLY OG — חסרות הרשאות</title>
  <style>
    body { margin:0; background:#08080d; color:#e7e7ef; font-family:system-ui,"Segoe UI",Arial,sans-serif; display:flex; min-height:100vh; align-items:center; justify-content:center; }
    .box { max-width:560px; padding:32px; line-height:1.7; }
    h1 { font-size:22px; margin:0 0 12px; }
    code { background:#1a1a24; padding:2px 6px; border-radius:5px; font-size:13px; }
    .warn { color:#ffb454; font-weight:700; }
  </style>
</head>
<body>
  <div class="box">
    <h1>צריך קודם להגדיר את הרשאות ה-Google</h1>
    <p class="warn">החיבור לא יכול להתחיל — חסרים משתני סביבה.</p>
    <p>
      כדי להפעיל את החיבור האמיתי, יש להגדיר ב-Vercel (או ב-<code>.env.local</code>)
      את המשתנים הבאים:
    </p>
    <ul>
      <li><code>GOOGLE_CLIENT_ID</code></li>
      <li><code>GOOGLE_CLIENT_SECRET</code></li>
      <li><code>GOOGLE_REDIRECT_URI</code></li>
    </ul>
    <p>
      את שני הראשונים יוצרים ב-Google Cloud Console תחת
      <strong>OAuth Client (Web)</strong>. אחרי שתגדירי אותם ותעשי Redeploy —
      חזרי לכאן ולחצי שוב על "התחברי ל-Google".
    </p>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    status: 500,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    return missingCredentialsPage();
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
    });
    return NextResponse.redirect(url);
  } catch (err) {
    console.error("[/api/google/auth] שגיאה בבניית כתובת ההסכמה:", err);
    return missingCredentialsPage();
  }
}
