import { AppError } from "@/lib/errors/app-error";
import { createServiceRequest } from "@/lib/services/service-request.service";
import { createServiceRequestSchema } from "@/lib/validations/service-request.schema";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

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
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: error.issues,
          },
        },
        { status: 400 },
      );
    }

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
