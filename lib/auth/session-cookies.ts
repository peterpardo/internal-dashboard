import { cookies } from "next/headers";

const COOKIE_NAME = "session_id";

export async function setSessionCookie(sessionId: string) {
  (await cookies()).set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSessionCookie() {
  return (await cookies()).get(COOKIE_NAME)?.value ?? null;
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}
