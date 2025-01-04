import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import { useNavigate } from "@remix-run/react";
import { DeleteReimbursement } from "./delete_reimbursement";

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
          <DropdownMenuItem onClick={handleEdit}>
            Update Reimbursement
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
