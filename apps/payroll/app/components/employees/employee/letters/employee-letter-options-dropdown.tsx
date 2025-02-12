import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate } from "@remix-run/react";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { DeleteEmployeeLetter } from "./delete-letter";

export const EmployeeLetterOptionsDropdown = ({
  letterIds,
  triggerChild,
}: {
  letterIds: {
    id: string;
    employeeId: string;
  };
  triggerChild: React.ReactElement;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  const handleViewLetter = () => {
    navigate(`/employees/${letterIds.employeeId}/letters/${letterIds.id}`);
  };

  const handleLetterUpdate = () => {
    navigate(
      `/employees/${letterIds.employeeId}/letters/${letterIds.id}/update-letter`,
    );
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleViewLetter}>
            View Letter
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator
          className={cn(
            !hasPermission(
              role,
              `${updateRole}:${attribute.employeeLetters}`,
            ) &&
              !hasPermission(
                role,
                `${deleteRole}:${attribute.employeeLetters}`,
              ) &&
              "hidden",
          )}
        />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              !hasPermission(
                role,
                `${updateRole}:${attribute.employeeLetters}`,
              ) && "hidden",
            )}
            onClick={handleLetterUpdate}
          >
            Update Letter
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(
                role,
                `${deleteRole}:${attribute.employeeLetters}`,
              ) && "flex",
            )}
          />
          <DeleteEmployeeLetter letterIds={letterIds} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
