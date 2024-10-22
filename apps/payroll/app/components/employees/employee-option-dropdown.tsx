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

export const EmployeeOptionsDropdown = ({
  employee,
  triggerChild,
}: {
  employee: {
    id: string;
    is_active: boolean;
    returnTo?: string;
  };
  triggerChild: React.ReactElement;
}) => {
  const submit = useSubmit();

  const handleMarkAsActive = () => {
    submit(
      {
        id: employee.id,
        is_active: true,
        returnTo: employee.returnTo ?? '/employees',
      },
      {
        method: "POST",
        action: `/employees/${employee.id}/update-active`,
      },
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
      },
    );
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(employee.is_active && "hidden")}
            onClick={handleMarkAsActive}
          >
            Make as Active
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(!employee.is_active && "hidden")}
            onClick={handleMarkAsInactive}
          >
            Make as Inactive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteEmployee employeeId={employee.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
