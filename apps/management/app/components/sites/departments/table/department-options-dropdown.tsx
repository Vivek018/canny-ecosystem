import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteDepartment } from "../delete-department";
import { useNavigate } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

export const DepartmentOptionsDropdown = ({
  id,
  triggerChild,
}: {
  id: string;

  triggerChild: React.ReactElement;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`${id}/update-department`);
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              "hidden",
              hasPermission(role, `${updateRole}:${attribute.departments}`) &&
                "flex"
            )}
            onClick={handleEdit}
          >
            Edit Department
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.departments}`) &&
                "flex"
            )}
          />
          <DeleteDepartment id={id} role={role} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
