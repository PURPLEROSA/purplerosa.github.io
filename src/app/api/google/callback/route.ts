/* =============================================================
 * GET /api/google/callback — סיום זרימת OAuth של Google
 * מקבל את ה-?code, ממיר אותו ל-tokens, ומציג לשלי את ה-refresh
 * token כדי שתוכל להוסיף אותו כמשתנה סביבה ב-Vercel.
 * ============================================================= */

import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

/** עוטף תוכן ב-HTML בעברית RTL עם רקע כהה. */
function htmlPage(title: string, inner: string, status = 200): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SHELLY OG — ${title}</title>
  <style>
    body { margin:0; background:#08080d; color:#e7e7ef; font-family:system-ui,"Segoe UI",Arial,sans-serif; display:flex; min-height:100vh; align-items:center; justify-content:center; }
    .box { max-width:620px; padding:32px; line-height:1.75; }
    h1 { font-size:23px; margin:0 0 14px; }
    p { margin:10px 0; }
    ol { padding-inline-start:22px; }
    li { margin:6px 0; }
    .token { display:block; background:#15151f; border:1px solid #2a2a3a; color:#9ad17f; padding:14px 16px; border-radius:10px; font-family:ui-monospace,Menlo,Consolas,monospace; font-size:13px; word-break:break-all; white-space:pre-wrap; user-select:all; margin:14px 0; }
    .warn { color:#ffb454; font-weight:700; }
    .err { color:#ff6b6b; font-weight:700; }
    code { background:#1a1a24; padding:2px 6px; border-radius:5px; font-size:13px; }
    .ok { color:#9ad17f; font-weight:700; }
  </style>
</head>
<body>
  <div class="box">
    ${inner}
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return htmlPage(
      "החיבור בוטל",
      `<h1>החיבור ל-Google בוטל</h1>
       <p class="err">Google החזירה שגיאה: ${oauthError}</p>
       <p>אפשר לנסות שוב מעמוד ההגדרות — לחצי על "התחברי ל-Google".</p>`,
      400
    );
  }

  if (!code) {
    return htmlPage(
      "חסר קוד אימות",
      `<h1>חסר קוד אימות</h1>
       <p class="err">לא התקבל פרמטר <code>code</code> מ-Google.</p>
       <p>חזרי לעמוד ההגדרות והתחילי את החיבור מחדש.</p>`,
      400
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    return htmlPage(
      "חסרות הרשאות",
      `<h1>חסרות הרשאות OAuth</h1>
       <p class="err">צריך להגדיר קודם את <code>GOOGLE_CLIENT_ID</code> ו-<code>GOOGLE_CLIENT_SECRET</code>.</p>`,
      500
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return htmlPage(
        "לא התקבל refresh token",
        `<h1>לא התקבל refresh token</h1>
         <p class="warn">Google לא החזירה refresh token — בדרך כלל זה קורה כשכבר אישרת גישה בעבר.</p>
         <p>כדי לקבל טוקן חדש:</p>
         <ol>
           <li>היכנסי ל-<code>myaccount.google.com/permissions</code></li>
           <li>בטלי את הגישה של האפליקציה (Revoke access).</li>
           <li>חזרי לעמוד ההגדרות ולחצי שוב על "התחברי ל-Google".</li>
         </ol>`,
        400
      );
    }

    return htmlPage(
      "החיבור הצליח",
      `<h1 class="ok">החיבור הצליח! 🎉</h1>
       <p>זה ה-<strong>refresh token</strong> שלך. העתיקי אותו (לחיצה עליו מסמנת את כולו):</p>
       <code class="token">${refreshToken}</code>
       <p class="warn">שמרי אותו בסוד — הוא נותן גישה לחשבון ה-Google שלך. אל תשתפי אותו עם אף אחד.</p>
       <p>עכשיו:</p>
       <ol>
         <li>העתיקי את הטוקן הזה.</li>
         <li>הוסיפי אותו ב-Vercel כמשתנה הסביבה <code>GOOGLE_REFRESH_TOKEN</code>.</li>
         <li>ודאי שגם <code>SHELLY_DATA_MODE</code> מוגדר ל-<code>live</code>.</li>
         <li>עשי <strong>Redeploy</strong> — ומאותו רגע SHELLY OG תעבוד עם הנתונים האמיתיים שלך.</li>
       </ol>`
    );
  } catch (err) {
    console.error("[/api/google/callback] החלפת הקוד נכשלה:", err);
    return htmlPage(
      "שגיאה בחיבור",
      `<h1>שגיאה בהחלפת הקוד</h1>
       <p class="err">לא הצלחנו להמיר את קוד האימות ל-token.</p>
       <p>ודאי ש-<code>GOOGLE_REDIRECT_URI</code> זהה בדיוק לזה שמוגדר ב-Google Cloud Console, ואז נסי שוב.</p>`,
      500
    );
  }
}
