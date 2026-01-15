import { createSessionRecord } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/session-cookies";
import { toHttpErrorResponse } from "@/lib/http/to-http-response";
import { signIn } from "@/lib/services/auth.service";
import { signInSchema } from "@/lib/validations/auth.schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = signInSchema.parse(body);
    const { userId } = await signIn({
      ...input,
      tenantId: process.env.DEFAULT_TENANT_ID as string,
    });

    const sessionId = await createSessionRecord(userId);
    await setSessionCookie(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return toHttpErrorResponse(error);
  }
}
