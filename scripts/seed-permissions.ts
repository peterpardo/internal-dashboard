import { pool } from "./db";

const PERMISSIONS = [
  { key: "user.read", description: "Read users" },
  { key: "user.create", description: "Create users" },
  { key: "service_request.create", description: "Create service requests" },
  { key: "service_request.change_status", description: "Change request status" },
];

async function seedPermissions() {
  for (const perm of PERMISSIONS) {
    await pool.query(
      `
        INSERT INTO permissions (key, description)
        VALUES ($1, $2)
        ON CONFLICT (key) DO NOTHING
        `,
      [perm.key, perm.description],
    );
  }

  console.log("Permissions seeded");
  await pool.end();
}

seedPermissions();
