import { randomUUID } from "crypto";
import { pool } from "./db";

async function seedTenant() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tenantId = randomUUID();

    // 1. Tenant
    await client.query(
      `
        INSERT INTO tenants (id, name, slug, status)
        VALUES ($1, 'Demo Tenant', 'demo', 'active')
        `,
      [tenantId],
    );
    console.log("Tenant seeded");

    // 2. Statuses
    const STATUSES = [
      { key: "open", label: "Open", order: 1, terminal: false },
      { key: "in_progress", label: "In Progress", order: 2, terminal: false },
      { key: "closed", label: "Closed", order: 3, terminal: true },
    ];

    for (const s of STATUSES) {
      await client.query(
        `
            INSERT INTO service_request_statuses (tenant_id, key, label, order_index, is_terminal)
            VALUES ($1, $2, $3, $4, $5)
            `,
        [tenantId, s.key, s.label, s.order, s.terminal],
      );
    }
    console.log("Statuses seeded");

    const adminId = randomUUID();

    // 3. Roles
    await client.query(
      `
        INSERT INTO roles (tenant_id, id, name)
        VALUES ($1, $2, 'Admin')
        `,
      [tenantId, adminId],
    );
    console.log("Role seeded");

    // 4. Roles permissions
    await client.query(
      `
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT $1, id FROM permissions
        ON CONFLICT DO NOTHING
        `,
      [adminId],
    );
    console.log("Role_permissions seeded");

    await client.query("COMMIT");
    console.log("Tenant bootstrapped");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedTenant();
