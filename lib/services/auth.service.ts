import { pool } from "@/lib/db";
import { AppError } from "@/lib/errors/app-error";
import bcrypt from "bcrypt";

type SignInInput = {
  tenantId: string;
  email: string;
  password: string;
};

export async function signIn({ tenantId, email, password }: SignInInput) {
  const result = await pool.query(
    `
        SELECT id, password_hash, status
        FROM users
        WHERE tenant_id = $1
        AND email = $2
        `,
    [tenantId, email],
  );

  if (result.rowCount === 0) {
    throw new AppError("INVALID_CREDENTIALS", 401, "Invalid credentials.");
  }

  const user = result.rows[0];

  if (user.status !== "active") {
    throw new AppError("USER_INACTIVE", 403, "Account disabled");
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AppError("INVALID_CREDENTIALS", 401, "Invalid credentials.");
  }

  await pool.query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [user.id]);

  return { userId: user.id };
}
