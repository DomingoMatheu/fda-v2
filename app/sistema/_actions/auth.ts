"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_PASSWORD, findUser } from "../_data/users";
import {
  SESSION_COOKIE,
  SESSION_HOURS,
  SESSION_PATH,
  encodeSession,
} from "../_lib/session-cookie";
import type { LoginState } from "../_types";

const SESSION_SECONDS = SESSION_HOURS * 60 * 60;

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = findUser(username);
  if (!user || password !== DEMO_PASSWORD) {
    return { error: "El usuario o la clave no son correctos." };
  }

  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  (await cookies()).set(
    SESSION_COOKIE,
    encodeSession({ username, expiresAt }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: SESSION_PATH,
      maxAge: SESSION_SECONDS,
    },
  );
  redirect("/sistema");
}

export async function logout(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { path: SESSION_PATH, maxAge: 0 });
  redirect("/sistema/login");
}
