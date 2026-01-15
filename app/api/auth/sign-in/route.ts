import { createSessionRecord } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/session-cookies";
import { AppError } from "@/lib/errors/app-error";
import { signIn } from "@/lib/services/auth.service";
import { signInSchema } from "@/lib/validations/auth.schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = signInSchema.parse(body);
    const { userId } = await signIn(input);

    const sessionId = await createSessionRecord(userId);
    await setSessionCookie(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong",
        },
      },
      { status: 500 },
    );
  }
}
