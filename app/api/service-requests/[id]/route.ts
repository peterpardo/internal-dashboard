import { getUserPermissions } from "@/lib/auth/get-user-permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { getSessionRecord } from "@/lib/auth/session";
import { getSessionCookie } from "@/lib/auth/session-cookies";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { toHttpErrorResponse } from "@/lib/http/to-http-response";
import { getServiceRequest, updateServiceRequest } from "@/lib/services/service-request.service";
import { updateServiceRequestSchema } from "@/lib/validations/service-request.schema";
import { NextRequest, NextResponse } from "next/server";

const assertServiceRequestRead = requirePermission(PERMISSIONS.SERVICE_REQUEST_READ);
const assertServiceRequestUpdate = requirePermission(PERMISSIONS.SERVICE_REQUEST_UPDATE);

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

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/service-requests/[id]">) {
  try {
    const { id: requestId } = await ctx.params;
    const sessionId = (await getSessionCookie()) as string;
    const session = await getSessionRecord(sessionId);

    await assertServiceRequestUpdate(session.user_id, session.tenant_id);
    const permissions = await getUserPermissions(session.user_id, session.tenant_id);

    const body = await req.json();
    const input = updateServiceRequestSchema.parse(body);

    const transformedInput = {
      title: input?.title,
      description: input?.description,
      clearDescription: input?.clear_description,
      priority: input?.priority,
      clearPriority: input?.clear_priority,
      assignedTo: input?.assigned_to,
      clearAssignedTo: input?.clear_assigned_to,
      dueDate: input?.due_date,
      clearDueDate: input?.clear_due_date,
    };

    const actor = {
      userId: session.user_id,
      tenantId: session.tenant_id,
      permissions,
    };

    await updateServiceRequest(actor, requestId, transformedInput);

    return NextResponse.json({ message: "Update successful" });
  } catch (error) {
    return toHttpErrorResponse(error);
  }
}
