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
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

export const ReimbursementOptionsDropdown = ({
  reimbursementId,
  employeeId,
  triggerChild,
  isEmployeeRoute = false,
  hideOptions,
}: {
  hideOptions: boolean;
  reimbursementId: string;
  employeeId: string;
  triggerChild: React.ReactElement;
  isEmployeeRoute?: boolean;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(
      isEmployeeRoute
        ? `/employees/${employeeId}/reimbursements/${reimbursementId}/update-reimbursements`
        : `/approvals/reimbursements/${reimbursementId}/update-reimbursements`,
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
              hasPermission(
                role,
                `${updateRole}:${attribute.reimbursements}`,
              ) && "flex",
              hideOptions && "hidden",
            )}
          >
            Update Reimbursement
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(
                role,
                `${deleteRole}:${attribute.reimbursements}`,
              ) && "flex",
              hideOptions && "hidden",
            )}
          />
          <DeleteReimbursement
            isEmployeeRoute={isEmployeeRoute}
            id={reimbursementId}
            employeeId={employeeId}
            hideOptions={hideOptions}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
