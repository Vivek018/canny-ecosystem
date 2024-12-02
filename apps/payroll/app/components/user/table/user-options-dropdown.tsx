import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteUser } from "./delete-user";
import { useNavigate } from "@remix-run/react";

export const UserOptionsDropdown = ({
  id,
  triggerChild,
}: {
  id: string;

  triggerChild: React.ReactElement;
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/settings/users/${id}/update-user`);
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleEdit}>
            Edit User Data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteUser id={id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
