import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteExit } from "../exits/delete-exit";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUserRole } from "@/utils/user";

export const ExitOptionsDropdown = ({
  exitId,
  triggerChild,
}: {
  exitId: string;
  triggerChild: React.ReactElement;
}) => {
  const { role } = useUserRole();
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              "hidden",
              hasPermission(role, `${updateRole}:exits`) && "flex"
            )}
          >
            Edit Exit
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:exits`) && "flex"
            )}
          />
          <DeleteExit exitId={exitId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
