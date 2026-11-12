// Shape of the demo's session cookie. The real system will keep a signed JWT
// here instead.

export const SESSION_COOKIE = "fda-sistema-session";
export const SESSION_HOURS = 8;
export const SESSION_PATH = "/sistema";

interface SessionCookie {
  username: string;
  expiresAt: string;
}

export function encodeSession(session: SessionCookie): string {
  return JSON.stringify(session);
}

export function decodeSession(value: string): SessionCookie | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "username" in parsed &&
      "expiresAt" in parsed &&
      typeof parsed.username === "string" &&
      typeof parsed.expiresAt === "string"
    ) {
      return { username: parsed.username, expiresAt: parsed.expiresAt };
    }
    return null;
  } catch {
    return null;
  }
}
