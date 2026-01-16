import { pool } from "./db";

const PERMISSIONS = [
  {
    id: 1,
    key: "user.read",
    description: "Read user information",
  },
  {
    id: 2,
    key: "user.create",
    description: "Create new users",
  },
  {
    id: 3,
    key: "user.update",
    description: "Update existing users",
  },
  {
    id: 4,
    key: "user.delete",
    description: "Delete users",
  },
  {
    id: 5,
    key: "service_request.read",
    description: "Read service requests",
  },
  {
    id: 6,
    key: "service_request.create",
    description: "Create service requests",
  },
  {
    id: 7,
    key: "service_request.update",
    description: "Update service requests",
  },
  {
    id: 8,
    key: "service_request.change_status",
    description: "Change service request status",
  },
];

async function seedPermissions() {
  for (const perm of PERMISSIONS) {
    await pool.query(
      `
        INSERT INTO permissions (id, key, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (key) DO NOTHING
      `,
      [perm.id, perm.key, perm.description],
    );
  }

  console.log("Permissions seeded");
  await pool.end();
}

seedPermissions();
