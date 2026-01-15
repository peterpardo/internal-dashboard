import { Permission } from "@/lib/constants/permissions";
import { pool } from "@/lib/db";

export async function getUserPermissions(userId: string, tenantId: string) {
  const result = await pool.query(
    `
      SELECT p.key
      FROM permissions p
      WHERE EXISTS (
          SELECT 1
          FROM role_permissions rp
          JOIN user_roles ur ON ur.role_id = rp.role_id
          JOIN roles r ON r.id = ur.role_id
          WHERE rp.permission_id = p.id
          AND ur.user_id = $1
          AND r.tenant_id = $2
      );`,
    [userId, tenantId],
  );

  return new Set<Permission>(result.rows.map((r) => r.key));
}
