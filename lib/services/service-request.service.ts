import { Actor } from "@/lib/auth/actor";
import {
  canCreateServiceRequest,
  canReadAllServiceRequests,
  canReadOwnOrAssigned,
  canUpdateServiceRequest,
} from "@/lib/auth/service_request.policy";
import { pool } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";
import { randomUUID } from "crypto";

type CreateServiceRequestInput = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  assignedTo?: string;
  dueDate: Date;
};

type UpdateServiceRequestInput = {
  title?: string;
  description?: string;
  clearDescription?: boolean;
  priority?: "low" | "medium" | "high";
  clearPriority?: boolean;
  assignedTo?: string;
  clearAssignedTo?: boolean;
  dueDate?: Date;
  clearDueDate?: boolean;
};

export async function createServiceRequest(actor: Actor, input: CreateServiceRequestInput) {
  const client = await pool.connect();

  try {
    if (!canCreateServiceRequest(actor)) {
      throw new AppError("FORBIDDEN", 403, "Not allowed to create service requests");
    }

    await client.query("BEGIN");

    const statusRes = await client.query(
      `
          SELECT id 
          FROM service_request_statuses
          WHERE tenant_id = $1
          ORDER BY order_index ASC
          LIMIT 1
          `,
      [actor.tenantId],
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
      [actor.tenantId],
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
        actor.tenantId,
        requestNumber,
        input.title,
        input.description ?? null,
        input.priority,
        statusRes.rows[0].id,
        actor.userId,
        input.dueDate,
      ],
    );

    await client.query(
      `
      INSERT INTO service_request_status_history (service_request_id, from_status_id, to_status_id, changed_by, changed_at)
      VALUES ($1, $2, $3, $4, now())
      `,
      [requestId, statusRes.rows[0].id, statusRes.rows[0].id, actor.userId],
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
  if (canReadAllServiceRequests(actor)) {
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
    AND (
      requested_by = $2
      OR assigned_to = $2
      )
  `,
    [actor.tenantId, actor.userId],
  );

  return result.rows;
}

export async function getServiceRequest(actor: Actor, requestId: string) {
  if (!canReadOwnOrAssigned(actor)) {
    throw new AppError("FORBIDDEN", 403, "Not allowed to read service request");
  }

  if (canReadAllServiceRequests(actor)) {
    const result = await pool.query(
      `
      SELECT * FROM service_requests
      WHERE tenant_id = $1
      AND id = $2
      `,
      [actor.tenantId, requestId],
    );

    return result.rows[0] ?? null;
  }

  const result = await pool.query(
    `
      SELECT * FROM service_requests
      WHERE tenant_id = $1
      AND id = $2
      AND (
        requested_by = $3
        OR assigned_to = $3
      )
      `,
    [actor.tenantId, requestId, actor.userId],
  );

  return result.rows[0] ?? null;
}

export async function changeServiceRequestStatus(
  actor: Actor,
  requestId: string,
  statusId: string,
) {
  if (!canUpdateServiceRequest(actor)) {
    throw new AppError("FORBIDDEN", 403, "Not allowed to update service request");
  }

  await pool.query(
    `
      UPDATE service_requests
      SET current_status_id = $1
      WHERE tenant_id = $2
        AND id = $2
      
  `,
    [statusId, actor.tenantId, requestId],
  );
}

export async function updateServiceRequest(
  actor: Actor,
  requestId: string,
  input: UpdateServiceRequestInput,
) {
  if (!canUpdateServiceRequest(actor)) {
    throw new AppError("FORBIDDEN", 403, "Not allowed to update service request");
  }

  const result = await pool.query(
    `
    UPDATE service_requests
    SET 
      title = COALESCE($1, title),
      description = 
        CASE
          WHEN $2 = true THEN NULL
          ELSE COALESCE($3, description)
        END,
      priority = 
        CASE
          WHEN $4 = true THEN NULL
          ELSE COALESCE($5, priority)
        END,
      assigned_to = 
        CASE
          WHEN $6 = true THEN NULL
          ELSE COALESCE($7, assigned_to)
        END,
      due_date = 
        CASE
          WHEN $8 = true THEN NULL
          ELSE COALESCE($9, due_date)
        END,
      updated_at = now()
    WHERE id = $10
      AND tenant_id = $11
    `,
    [
      input?.title ?? null,
      input?.clearDescription ?? false,
      input?.description ?? null,
      input?.clearPriority ?? false,
      input?.priority ?? null,
      input?.clearAssignedTo ?? false,
      input?.assignedTo ?? null,
      input?.clearDueDate ?? false,
      input?.dueDate ?? null,
      requestId,
      actor.tenantId,
    ],
  );

  if (result.rowCount === 0) {
    throw new AppError("NOT_FOUND", 404, "Service request not found");
  }
}
