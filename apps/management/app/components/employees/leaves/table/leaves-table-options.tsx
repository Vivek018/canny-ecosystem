import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import { useNavigate } from "@remix-run/react";
import { DeleteLeave } from "./delete-leave";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

export const LeavesOptionsDropdown = ({
  leavesId,
  employeeId,
  triggerChild,
  isEmployeeRoute,
}: {
  leavesId: string;
  employeeId: string;
  triggerChild: React.ReactElement;
  isEmployeeRoute?: boolean;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(
      `/employees/${employeeId}/leaves/${leavesId}/${isEmployeeRoute}/update-leave`
    );
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleEdit}
            className={cn(
              "hidden",
              hasPermission(
                role,
                `${updateRole}:${attribute.employeeLeaves}`
              ) && "flex"
            )}
          >
            Update Leave
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(
                role,
                `${deleteRole}:${attribute.employeeLeaves}`
              ) && "flex"
            )}
          />
          <DeleteLeave
            id={leavesId}
            employeeId={employeeId}
            isEmployeeRoute={isEmployeeRoute}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
