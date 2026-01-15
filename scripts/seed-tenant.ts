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

    const adminRoleId = randomUUID();
    const requesterRoleId = randomUUID();
    const approverRoleId = randomUUID();
    const operatorRoleId = randomUUID();

    // 3. Roles
    await client.query(
      `
        INSERT INTO roles (tenant_id, id, name)
        VALUES ($1, $2, 'Admin'),
        ($3, $4, 'Requester'),
        ($5, $6, 'Approver'),
        ($7, $8, 'Operator')
        `,
      [
        tenantId,
        adminRoleId,
        tenantId,
        requesterRoleId,
        tenantId,
        approverRoleId,
        tenantId,
        operatorRoleId,
      ],
    );

    // 4. Roles permissions
    await client.query(
      `
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT $1, id FROM permissions
        ON CONFLICT DO NOTHING
        `,
      [adminRoleId],
    );
    await client.query(
      `
      INSERT INTO role_permissions (role_id, permission_id)
      VALUES ($1, 5),
      ($2, 6),
      ($3, 5),
      ($4, 8),
      ($5, 5),
      ($6, 8)
      `,
      [
        requesterRoleId,
        requesterRoleId,
        approverRoleId,
        approverRoleId,
        operatorRoleId,
        operatorRoleId,
      ],
    );

    // 5. Add Admin user
    // email: admin@demo.com
    // password: admin123
    const adminUserId = "ac72331f-f51f-4c7f-a8eb-95ccb7a6ed10";
    const testUserId = "34951adc-824f-48cc-a128-774dcb701048";
    const passwordHashAdmin = await bcrypt.hash("admin123", 10);
    const passwordHashTest = await bcrypt.hash("test123", 10);
    await client.query(
      `
      INSERT INTO users (id, tenant_id, email, password_hash, first_name, status)
      VALUES ($1, $2, 'admin@demo.com', $3, 'Demo Admin', 'active'),
      ($4, $5, 'tester@demo.com', $6, 'Tester', 'active')
      `,
      [adminUserId, tenantId, passwordHashAdmin, testUserId, tenantId, passwordHashTest],
    );

    // 6. User roles
    await client.query(
      `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2),
      ($3, $4)
      `,
      [adminUserId, adminRoleId, testUserId, requesterRoleId],
    );

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
