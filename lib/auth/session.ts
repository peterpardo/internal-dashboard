import { pool } from "@/lib/db";

export async function createSessionRecord(userId: string) {
  const result = await pool.query(
    `
        INSERT INTO sessions (user_id, expires_at)
        VALUES ($1, NOW() + INTERVAL  '1 hour')
        RETURNING id
        `,
    [userId],
  );
  return result.rows[0].id as string;
}

export async function getSessionRecord(sessionId: string) {
  const result = await pool.query(
    `
    SELECT s.id AS session_id, s.expires_at, u.id AS user_id, u.tenant_id, u.status
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = $1
    `,
    [sessionId],
  );

  if (result.rowCount === 0) return null;

  const session = result.rows[0];

  if (session.expires_at < new Date() || session.status !== "active") {
    await deleteSessionRecord(sessionId);
    return null;
  }

  return session;
}

export async function deleteSessionRecord(sessionId: string) {
  await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}
