import { Actor } from "@/lib/auth/actor";
import { PERMISSIONS } from "@/lib/constants/permissions";

export function canReadAllServiceRequests(actor: Actor) {
  return actor.permissions.has(PERMISSIONS.SERVICE_REQUEST_UPDATE);
}

export function canReadOwnOrAssigned(actor: Actor) {
  return actor.permissions.has(PERMISSIONS.SERVICE_REQUEST_READ);
}

export function canCreateServiceRequest(actor: Actor) {
  return actor.permissions.has(PERMISSIONS.SERVICE_REQUEST_CREATE);
}

export function canUpdateServiceRequest(actor: Actor) {
  return actor.permissions.has(PERMISSIONS.SERVICE_REQUEST_UPDATE);
}
