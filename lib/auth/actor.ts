import { Permission } from "@/lib/constants/permissions";

export type Actor = {
  userId: string;
  tenantId: string;
  permissions: Set<Permission>;
};
