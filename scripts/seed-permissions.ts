import { pool } from "./db";

export const PERMISSIONS = [
  {
    key: "user.read",
    description: "Read user information",
  },
  {
    key: "user.create",
    description: "Create new users",
  },
  {
    key: "user.update",
    description: "Update existing users",
  },
  {
    key: "user.delete",
    description: "Delete users",
  },
  {
    key: "service_request.read",
    description: "Read service requests",
  },
  {
    key: "service_request.create",
    description: "Create service requests",
  },
  {
    key: "service_request.update",
    description: "Update service requests",
  },
  {
    key: "service_request.change_status",
    description: "Change service request status",
  },
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
