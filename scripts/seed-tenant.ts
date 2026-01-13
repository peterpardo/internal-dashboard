import { randomUUID } from "crypto";
import { pool } from "./db";
import bcrypt from "bcrypt";

async function seedTenant() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tenantId = "e5452123-8ba5-4852-be16-df0111d7fbfb";

    // 1. Tenant
    await client.query(
      `
        INSERT INTO tenants (id, name, slug, status)
        VALUES ($1, 'Demo Tenant', 'demo', 'active')
        ON CONFLICT (slug) DO NOTHING
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

    const adminRoleId = randomUUID();

    // 3. Roles
    await client.query(
      `
        INSERT INTO roles (tenant_id, id, name)
        VALUES ($1, $2, 'Admin')
        `,
      [tenantId, adminRoleId],
    );
    console.log("Role seeded");

    // 4. Roles permissions
    await client.query(
      `
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT $1, id FROM permissions
        ON CONFLICT DO NOTHING
        `,
      [adminRoleId],
    );
    console.log("Role_permissions seeded");

    // 5. Add Admin user
    // email: admin@demo.com
    // password: admin123
    const adminUserId = "ac72331f-f51f-4c7f-a8eb-95ccb7a6ed10";
    const passwordHash = await bcrypt.hash("admin123", 10);
    await client.query(
      `
      INSERT INTO users (id, tenant_id, email, password_hash, first_name, status)
      VALUES ($1, $2, 'admin@demo.com', $3, 'Demo Admin', 'active')
      `,
      [adminUserId, tenantId, passwordHash],
    );
    console.log("User seeded");

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
