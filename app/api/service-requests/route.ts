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
    const tenantId = "e5452123-8ba5-4852-be16-df0111d7fbfb"; // Demo tenant
    const userId = "ac72331f-f51f-4c7f-a8eb-95ccb7a6ed10"; // Demo Admin id

    const body = await req.json();
    const input = createServiceRequestSchema.parse(body);

    const result = await createServiceRequest({
      tenantId,
      userId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.due_date,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    return toHttpErrorResponse(error);
  }
}
