import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import type {
  ImportEmployeeDetailsDataType,
  ImportEmployeeProjectAssignmentsDataType,
} from "@canny_ecosystem/supabase/queries";
import { DeleteImportedEmployeeProjectAssignments } from "./delete-imported-employee-project-assignments";
import { UpdateImportedEmployee } from "./update-imported-employee-project-assignments";

export const ImportedEmployeeProjectAssignmentsOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportEmployeeProjectAssignmentsDataType;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <UpdateImportedEmployee indexToUpdate={index} dataToUpdate={data} />
          <DropdownMenuSeparator />
          <DeleteImportedEmployeeProjectAssignments indexToDelete={index} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
