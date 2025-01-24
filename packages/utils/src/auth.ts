import { attribute } from "../constant";
import type { userRoles } from "./schema";

export const createRole = "create";
export const readRole = "read";
export const updateRole = "update";
export const deleteRole = "delete";

export const ROLES: { [key in (typeof userRoles)[number]]: readonly string[] } =
  {
    master: attribute.flatMap((value) => [
      `${createRole}:${value}`,
      `${readRole}:${value}`,
      `${updateRole}:${value}`,
      `${deleteRole}:${value}`,
    ]),
    admin: attribute.flatMap((value) => [
      `${createRole}:${value}`,
      `${readRole}:${value}`,
      `${updateRole}:${value}`,
    ]),
    operation_manager: attribute.flatMap((value) => [
      `${createRole}:${value}`,
      `${readRole}:${value}`,
      `${updateRole}:${value}`,
    ]),
    executive: attribute
      .filter((value) => !value.includes("feedback_list"))
      .flatMap((value) => [`${readRole}:${value}`]),
  } as const;

export function hasPermission(
  role: keyof typeof ROLES,
  permission: string
): boolean {
  const permissions = ROLES[role];
  return permissions ? permissions.includes(permission) : false;
}
