import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteUser } from "./delete-user";
import { useNavigate } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUserRole } from "@/utils/user";

export const UserOptionsDropdown = ({
  id,
  triggerChild,
}: {
  id: string;

  triggerChild: React.ReactElement;
}) => {
  const { role } = useUserRole();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/settings/users/${id}/update-user`);
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              "hidden",
              hasPermission(role, `${updateRole}:setting_users`) && "flex"
            )}
            onClick={handleEdit}
          >
            Edit User Data
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:setting_users`) && "flex"
            )}
          />
          <DeleteUser id={id} role={role} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
