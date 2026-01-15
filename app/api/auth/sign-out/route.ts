import { deleteSessionRecord } from "@/lib/auth/session";
import { clearSessionCookie, getSessionCookie } from "@/lib/auth/session-cookies";
import { NextResponse } from "next/server";

export async function POST() {
  const sessionId = await getSessionCookie();

  if (sessionId) {
    await deleteSessionRecord(sessionId);
  }

  clearSessionCookie();

  return NextResponse.json({ success: true });
}
