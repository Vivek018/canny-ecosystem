import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteEmployeePaymentTemplateAssignment } from "./delete-employee-payment-template-assignment";

export const LinkTemplateDropdown = ({
  employeeId,
  triggerChild,
}: {
  employeeId: string;
  triggerChild: React.ReactElement;
}) => {

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DeleteEmployeePaymentTemplateAssignment employeeId={employeeId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
