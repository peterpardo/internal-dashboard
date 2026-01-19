import { getUserPermissions } from "@/lib/auth/get-user-permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { getSessionRecord } from "@/lib/auth/session";
import { getSessionCookie } from "@/lib/auth/session-cookies";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { toHttpErrorResponse } from "@/lib/http/to-http-response";
import { createServiceRequest, listServiceRequests } from "@/lib/services/service-request.service";
import { createServiceRequestSchema } from "@/lib/validations/service-request.schema";
import { NextResponse } from "next/server";

const assertServiceRequestRead = requirePermission(PERMISSIONS.SERVICE_REQUEST_READ);
const assertServiceRequestCreate = requirePermission(PERMISSIONS.SERVICE_REQUEST_CREATE);

export async function GET() {
  const sessionId = (await getSessionCookie()) as string;
  const session = await getSessionRecord(sessionId);

  await assertServiceRequestRead(session.user_id, session.tenant_id);

  const permissions = await getUserPermissions(session.user_id, session.tenant_id);

  const data = await listServiceRequests({
    userId: session.user_id,
    tenantId: session.tenant_id,
    permissions,
  });

  return NextResponse.json({ message: "Successful", data });
}

export async function POST(req: Request) {
  try {
    const sessionId = (await getSessionCookie()) as string;
    const session = await getSessionRecord(sessionId);

    await assertServiceRequestCreate(session.user_id, session.tenant_id);

    const body = await req.json();
    const input = createServiceRequestSchema.parse(body);

    const permissions = await getUserPermissions(session.user_id, session.tenant_id);

    const actor = {
      userId: session.user_id,
      tenantId: session.tenant_id,
      permissions,
    };

    const transformedInput = {
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.due_date,
    };

    const result = await createServiceRequest(actor, transformedInput);

    return NextResponse.json({ data: result });
  } catch (error) {
    return toHttpErrorResponse(error);
  }
}
