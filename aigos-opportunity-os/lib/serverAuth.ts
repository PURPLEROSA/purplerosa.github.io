// =====================================================================
// Server-only helper: read the stored Google token from the cookie.
// Used by the API route handlers.
// =====================================================================

import { cookies } from "next/headers";
import type { GoogleTokens } from "./googleAuth";

export const TOKEN_COOKIE = "aigos_google_token";

/** Returns the stored access token, or undefined in demo mode. */
export function getStoredAccessToken(): string | undefined {
  try {
    const raw = cookies().get(TOKEN_COOKIE)?.value;
    if (!raw) return undefined;
    const tokens = JSON.parse(raw) as GoogleTokens;
    return tokens.accessToken;
  } catch {
    return undefined;
  }
}
