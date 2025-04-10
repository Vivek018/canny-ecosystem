import { attribute } from "../constant";
import type { userRoles } from "./schema";

export const createRole = "create";
export const readRole = "read";
export const updateRole = "update";
export const deleteRole = "delete";
export const approveRole = "approve";
export const emailRole = "email";

const attributeValues = Object.values(attribute);

export const ROLES: { [key in (typeof userRoles)[number]]: readonly string[] } =
  {
    master: [
      ...attributeValues.flatMap((value) => [
        `${createRole}:${value}`,
        `${readRole}:${value}`,
        `${updateRole}:${value}`,
        `${deleteRole}:${value}`,
        `${emailRole}:${value}`,
      ]),
      ...attributeValues
        .filter((value) => value.includes(attribute.payroll))
        .flatMap((value) => [`${approveRole}:${value}`]),
    ],

    admin: [
      ...attributeValues.flatMap((value) => [
        `${createRole}:${value}`,
        `${readRole}:${value}`,
        `${updateRole}:${value}`,
        `${emailRole}:${value}`,
      ]),
      ...attributeValues
        .filter((value) => value.includes(attribute.payroll))
        .flatMap((value) => [`${approveRole}:${value}`]),
    ],

    operation_manager: attributeValues.flatMap((value) => [
      `${createRole}:${value}`,
      `${readRole}:${value}`,
      `${updateRole}:${value}`,
      `${emailRole}:${value}`,
    ]),

    executive: attributeValues
      .filter((value) => !value.includes(attribute.feedbackList))
      .flatMap((value) => [`${readRole}:${value}`]),

    supervisor: [],
  } as const;

export function hasPermission(
  role: keyof typeof ROLES,
  permission: string
): boolean {
  const permissions = ROLES[role];
  return permissions ? permissions.includes(permission) : false;
}
