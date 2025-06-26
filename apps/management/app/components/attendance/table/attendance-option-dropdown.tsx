import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { DeleteAttendance } from "./delete-attendance";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useNavigate } from "@remix-run/react";

export const AttendanceOptionsDropdown = ({
  attendanceId,
  triggerChild,
}: {
  attendanceId: string;
  triggerChild: React.ReactElement;
}) => {

  const { role } = useUser();
  const navigate = useNavigate();
  const handleUpdate = () => {
    navigate(`/time-tracking/attendance/${attendanceId}/update-attendance`);
  };
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              !hasPermission(role, `${updateRole}:${attribute.attendance}`) &&
                "hidden"
            )}
            onClick={handleUpdate}
          >
            Update
          </DropdownMenuItem>

          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.attendance}`) &&
                "flex"
            )}
          />
          <DeleteAttendance attendanceId={attendanceId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
