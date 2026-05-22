// =====================================================================
// googleAuth - Google OAuth 2.0 (server-side / "web server app" flow).
//
// Docs: https://developers.google.com/identity/protocols/oauth2/web-server
//
// Phase 1: demo mode is on, none of this runs.
// Phase 2: set the GOOGLE_* env vars and NEXT_PUBLIC_DEMO_MODE=false.
// =====================================================================

/**
 * Minimal scopes - we ask for the least access that still lets the app work.
 *   gmail.readonly  -> detect incoming opportunities (read only)
 *   gmail.compose   -> create DRAFTS only (cannot send on its own)
 *   spreadsheets    -> read/write the opportunities database
 *   calendar.events -> create private follow-up reminders (after approval)
 *   userinfo.email  -> show which account is connected
 *
 * Always re-check the official docs for the current recommended scopes:
 * https://developers.google.com/workspace/guides/configure-oauth-consent
 */
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
}

/**
 * Demo mode is ON unless explicitly disabled AND credentials are present.
 * This guarantees the app never tries to reach Google by accident.
 */
export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") {
    return !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
  }
  return true;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local before disabling demo mode.`,
    );
  }
  return value;
}

/** Build the Google consent screen URL to redirect the user to. */
export function getAuthUrl(state = "aigos"): string {
  const params = new URLSearchParams({
    client_id: requireEnv("GOOGLE_CLIENT_ID"),
    redirect_uri:
      process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:3000/api/auth/google/callback",
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

/** Exchange the one-time code from the callback for access/refresh tokens. */
export async function exchangeCodeForTokens(
  code: string,
): Promise<GoogleTokens> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri:
        process.env.GOOGLE_REDIRECT_URI ||
        "http://localhost:3000/api/auth/google/callback",
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status}`);
  }
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    scope: data.scope,
  };
}

/** Get a fresh access token using a stored refresh token. */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<GoogleTokens> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status}`);
  }
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    scope: data.scope,
  };
}
