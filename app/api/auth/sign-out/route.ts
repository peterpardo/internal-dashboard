import { deleteSessionRecord } from "@/lib/auth/session";
import { clearSessionCookie, getSessionCookie } from "@/lib/auth/session-cookies";
import { toHttpErrorResponse } from "@/lib/http/to-http-response";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const sessionId = await getSessionCookie();

    if (sessionId) {
      await deleteSessionRecord(sessionId);
    }

    clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    return toHttpErrorResponse(error);
  }
}
