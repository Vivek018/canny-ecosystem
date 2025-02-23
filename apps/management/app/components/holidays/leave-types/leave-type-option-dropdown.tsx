import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate} from "@remix-run/react";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { DeleteLeaveType } from "./delete-leave-type";

export const LeaveTypeOptionsDropdown = ({
  id,
  triggerChild,
}: {
  id: string;
  triggerChild: React.ReactElement;
}) => {
  const navigate = useNavigate();
  const { role } = useUser();

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              "",
              !hasPermission(role, `${updateRole}:${attribute.holidays}`) &&
                "hidden"
            )}
            onClick={() => {
              navigate(`/time-tracking/holidays/${id}/update-leave-type`);
            }}
          >
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.holidays}`) &&
                "flex"
            )}
          />
          <DeleteLeaveType id={id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
