import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSubmit } from "@remix-run/react";
import { DeleteEmployee } from "./delete-employee";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { EmployeeDialog } from "../link-template/employee-dialog";
import {
  createRole,
  deleteRole,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

export const EmployeeOptionsDropdown = ({
  employee,
  triggerChild,
  env,
}: {
  employee: {
    id: string;
    is_active: boolean;
    returnTo?: string;
    companyId: string;
  };
  triggerChild: React.ReactElement;
  env: SupabaseEnv;
}) => {
  const submit = useSubmit();
  const { role } = useUser();
  const handleMarkAsActive = () => {
    submit(
      {
        id: employee.id,
        is_active: true,
        returnTo: employee.returnTo ?? "/employees",
      },
      {
        method: "POST",
        action: `/employees/${employee.id}/update-active`,
      }
    );
  };

  const handleMarkAsInactive = () => {
    submit(
      {
        id: employee.id,
        is_active: false,
        returnTo: employee.returnTo ?? "/employees",
      },
      {
        method: "POST",
        action: `/employees/${employee.id}/update-active`,
      }
    );
  };

  const handleAccident = () => {
    submit(
      {
        id: employee.id,
      },
      {
        method: "POST",
        action: `/accidents/${employee.id}/create-accident`,
      }
    );
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              employee.is_active && "hidden",
              !hasPermission(role, `${updateRole}:${attribute.employees}`) &&
                "hidden"
            )}
            onClick={handleMarkAsActive}
          >
            Make as Active
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              !employee.is_active && "hidden",
              !hasPermission(role, `${updateRole}:${attribute.employees}`) &&
                "hidden"
            )}
            onClick={handleMarkAsInactive}
          >
            Make as Inactive
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              !hasPermission(role, `${updateRole}:${attribute.employees}`) &&
                !hasPermission(role, `${deleteRole}:${attribute.employees}`) &&
                "hidden"
            )}
          />
          <EmployeeDialog employee={employee} env={env} />
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.employees}`) &&
                "flex"
            )}
          />
          <DropdownMenuItem
            className={cn(
              !employee.is_active && "hidden",
              !hasPermission(role, `${createRole}:${attribute.accidents}`) &&
                "hidden"
            )}
            onClick={handleAccident}
          >
            Report Accident
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.accidents}`) &&
                "flex"
            )}
          />
          <DeleteEmployee employeeId={employee.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
