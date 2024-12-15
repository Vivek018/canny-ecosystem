import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@canny_ecosystem/ui/dropdown-menu";

import { useNavigate } from "@remix-run/react";

export const ReimbursementOptionsDropdown = ({
  id,
  triggerChild,
}: {
  id: string;

  triggerChild: React.ReactElement;
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/approvals/reimbursements/${id}/add-reimbursements`);
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleEdit}>
            Add Reimbursement
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
