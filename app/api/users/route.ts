import { requirePermission } from "@/lib/auth/require-permission";
import { getSessionRecord } from "@/lib/auth/session";
import { getSessionCookie } from "@/lib/auth/session-cookies";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { AppError } from "@/lib/errors/app-error";
import { NextResponse } from "next/server";

const assertUserRead = requirePermission(PERMISSIONS.USER_READ);

export async function GET() {
  try {
    const sessionId = (await getSessionCookie()) as string;
    const session = await getSessionRecord(sessionId);
    const tenantId = session.tenant_id ?? (process.env.DEFAULT_TENANT_ID as string);

    await assertUserRead(session.user_id, tenantId);

    return NextResponse.json({ data: "users fetched..." });
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
