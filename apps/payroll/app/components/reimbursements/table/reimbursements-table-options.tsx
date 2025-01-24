import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import { useNavigate } from "@remix-run/react";
import { DeleteReimbursement } from "./delete-reimbursement";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { useUserRole } from "@/utils/user";

export const ReimbursementOptionsDropdown = ({
  reimbursementId,
  employeeId,
  triggerChild,
  isEmployeeRoute = false,
}: {
  reimbursementId: string;
  employeeId: string;
  triggerChild: React.ReactElement;
  isEmployeeRoute?: boolean;
}) => {
  const { role } = useUserRole();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(
      isEmployeeRoute
        ? `/employees/${employeeId}/reimbursements/${reimbursementId}/update-reimbursements`
        : `/approvals/reimbursements/${reimbursementId}/update-reimbursements`
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
              hasPermission(`${role}`, `${updateRole}:reimbursements`) && "flex"
            )}
          >
            Update Reimbursement
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(`${role}`, `${deleteRole}:reimbursements`) && "flex"
            )}
          />
          <DeleteReimbursement
            isEmployeeRoute={isEmployeeRoute}
            id={reimbursementId}
            employeeId={employeeId}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
