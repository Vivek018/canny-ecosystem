import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate } from "@remix-run/react";
import { createRole, deleteRole, hasPermission } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { DeleteEmployeeExits } from "./delete-employee-exits";

export const ExitsDropdown = ({
  exitId,
  triggerChild,
}: {
  exitId: string;
  triggerChild: React.ReactElement;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              !hasPermission(role, `${createRole}:${attribute.employeeExits}`) &&
              "hidden",
            )}
            onClick={() => navigate(`/approvals/exits/${exitId}/update-exit`)}
          >
            Edit exit
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.employeeExits}`) &&
              "flex",
            )}
          />
          <DeleteEmployeeExits exitId={exitId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
