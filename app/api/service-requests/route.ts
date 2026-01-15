import { toHttpErrorResponse } from "@/lib/http/to-http-response";
import { createServiceRequest } from "@/lib/services/service-request.service";
import { createServiceRequestSchema } from "@/lib/validations/service-request.schema";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Server up!" });
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
