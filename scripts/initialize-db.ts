import { pool } from "@/scripts/db";
import { readFileSync } from "fs";
import path from "path";

async function initializeDb() {
  const filePath = path.join(__dirname, "sql/schema.sql");
  const sql = readFileSync(filePath, "utf8");

  await pool.query(sql);
  await pool.end();

  console.log("Schema applied successfully");
}

initializeDb().catch((error) => {
  console.error(error);
  process.exit(1);
});
