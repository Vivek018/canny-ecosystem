import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteExit } from "./delete-exit";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { useNavigate } from "@remix-run/react";

export const ExitOptionsDropdown = ({
  exitId,
  triggerChild,
  hideOptions,
}: {
  hideOptions: boolean;
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
              "hidden",
              hasPermission(role, `${updateRole}:${attribute.exits}`) && "flex",
              hideOptions && "hidden"
            )}
            onClick={() => navigate(`/approvals/exits/${exitId}/update-exit`)}
          >
            Edit Exit
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.exits}`) && "flex"
            )}
          />
          <DeleteExit exitId={exitId} hideOptions={hideOptions} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
