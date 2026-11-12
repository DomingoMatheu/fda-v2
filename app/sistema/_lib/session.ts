import { cookies } from "next/headers";
import { findUser } from "../_data/users";
import type { Session } from "../_types";
import { SESSION_COOKIE, decodeSession } from "./session-cookie";

// The signed-in user, or null when there is no valid session.
export async function getSession(): Promise<Session | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  const cookie = value ? decodeSession(value) : null;
  if (!cookie || Date.parse(cookie.expiresAt) <= Date.now()) return null;
  const user = findUser(cookie.username);
  return user ? { user, expiresAt: cookie.expiresAt } : null;
}
