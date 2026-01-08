import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
  pool?: Pool;
};

export const pool =
  globalForPg.pool ??
  new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT as string),
    database: process.env.PGDATABASE,
    ssl: process.env.NODE_ENV === "production",
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pool = pool;
}
