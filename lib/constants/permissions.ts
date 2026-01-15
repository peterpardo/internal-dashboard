export const PERMISSIONS = {
  USER_READ: "user.read",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",

  SERVICE_REQUEST_READ: "service_request.read",
  SERVICE_REQUEST_CREATE: "service_request.create",
  SERVICE_REQUEST_UPDATE: "service_request.update",
  SERVICE_REQUEST_DELETE: "service_request.delete",
  SERVICE_REQUEST_CHANGE_STATUS: "service_request.change_status",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
