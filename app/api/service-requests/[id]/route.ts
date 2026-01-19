import { getUserPermissions } from "@/lib/auth/get-user-permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { getSessionRecord } from "@/lib/auth/session";
import { getSessionCookie } from "@/lib/auth/session-cookies";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { toHttpErrorResponse } from "@/lib/http/to-http-response";
import { getServiceRequest } from "@/lib/services/service-request.service";
import { NextRequest, NextResponse } from "next/server";

const assertServiceRequestRead = requirePermission(PERMISSIONS.SERVICE_REQUEST_READ);

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/service-requests/[id]">) {
  try {
    const { id } = await ctx.params;
    const sessionId = (await getSessionCookie()) as string;
    const session = await getSessionRecord(sessionId);

    await assertServiceRequestRead(session.user_id, session.tenant_id);
    const permissions = await getUserPermissions(session.user_id, session.tenant_id);

    const result = await getServiceRequest(
      { userId: session.user_id, tenantId: session.tenant_id, permissions },
      id,
    );

    return NextResponse.json({ message: "Successful", data: result });
  } catch (error) {
    return toHttpErrorResponse(error);
  }
}
