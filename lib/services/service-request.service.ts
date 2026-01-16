import { Actor } from "@/lib/auth/actor";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { pool } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";
import { randomUUID } from "crypto";

type CreateServiceRequestInput = {
  tenantId: string;
  userId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate: Date;
};

export async function createServiceRequest(input: CreateServiceRequestInput) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const statusRes = await client.query(
      `
            SELECT id 
            FROM service_request_statuses
            WHERE tenant_id = $1
            ORDER BY order_index ASC
            LIMIT 1
            `,
      [input.tenantId],
    );

    if (!statusRes.rows[0]) {
      throw new AppError("NO_INITIAL_STATUS", 500, "No service request status configured");
    }

    const sequenceRes = await client.query(
      `
        INSERT INTO service_request_counters (tenant_id, last_number)
        VALUES ($1, 1)
        ON CONFLICT (tenant_id)
        DO UPDATE SET last_number = service_request_counters.last_number + 1
        RETURNING last_number
      `,
      [input.tenantId],
    );
    const sequenceNumber = sequenceRes.rows[0].last_number;

    const requestId = randomUUID();
    const requestNumber = `SR-${new Date().getFullYear()}-${String(sequenceNumber).padStart(6, "0")}`;

    await client.query(
      `
        INSERT INTO service_requests (id, tenant_id, request_number, title, description, priority, current_status_id, requested_by, due_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
      [
        requestId,
        input.tenantId,
        requestNumber,
        input.title,
        input.description ?? null,
        input.priority,
        statusRes.rows[0].id,
        input.userId,
        input.dueDate,
      ],
    );

    await client.query(
      `
        INSERT INTO service_request_status_history (service_request_id, from_status_id, to_status_id, changed_by, changed_at)
        VALUES ($1, $2, $3, $4, now())
        `,
      [requestId, statusRes.rows[0].id, statusRes.rows[0].id, input.userId],
    );

    await client.query("COMMIT");

    return { id: requestId, requestNumber };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
}

export async function listServiceRequests(actor: Actor) {
  if (actor.permissions.has(PERMISSIONS.SERVICE_REQUEST_UPDATE)) {
    const result = await pool.query(
      `
      SELECT * FROM service_requests
      WHERE tenant_id = $1
      `,
      [actor.tenantId],
    );

    return result.rows;
  }

  const result = await pool.query(
    `
    SELECT * from service_requests
    WHERE tenant_id = $1 
      AND requested_by = $2
    `,
    [actor.tenantId, actor.userId],
  );

  return result.rows;
}
