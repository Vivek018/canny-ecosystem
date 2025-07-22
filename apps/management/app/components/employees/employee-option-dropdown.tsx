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
}: {
  employee: {
    id: string;
    is_active: boolean;
    returnTo?: string;
    companyId: string;
  };
  triggerChild: React.ReactElement;
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

  const handleIncident = () => {
    submit(
      {
        id: employee.id,
      },
      {
        method: "POST",
        action: `/events/incidents/${employee.id}/create-incident`,
      }
    );
  };
  const handleAttendance = () => {
    submit(
      {
        id: employee.id,
      },
      {
        method: "POST",
        action: `/employees/${employee.id}/add-attendance`,
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
          <DropdownMenuItem
            className={cn(
              !hasPermission(role, `${createRole}:${attribute.incidents}`) &&
                "hidden"
            )}
            onClick={handleIncident}
          >
            Report Incident
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={cn(
              !hasPermission(role, `${createRole}:${attribute.incidents}`) &&
                "hidden"
            )}
            onClick={handleAttendance}
          >
            Add Attendance
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.incidents}`) &&
                "flex"
            )}
          />
          <DeleteEmployee employeeId={employee.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
