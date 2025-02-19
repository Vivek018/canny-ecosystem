import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteEmployeeExits } from "./delete-employee-exits";

export const ExitsDropdown = ({
  exitId,
  employeeId,
  triggerChild,
}: {
  exitId: string;
  employeeId: string;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DeleteEmployeeExits exitId={exitId} employeeId={employeeId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
