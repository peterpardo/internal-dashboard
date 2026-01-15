import { getUserPermissions } from "@/lib/auth/get-user-permissions";
import { Permission } from "@/lib/constants/permissions";
import { AppError } from "@/lib/errors/app-error";

export function requirePermission(permission: Permission) {
  return async function assertPermission(userId: string, tenantId: string) {
    const permissions = await getUserPermissions(userId, tenantId);

    if (!permissions.has(permission)) {
      throw new AppError("NOT_ALLOWED", 403, "Forbidden");
    }
  };
}
