import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import type { ImportEmployeeAttendanceByPresentsDataType } from "@canny_ecosystem/supabase/queries";
import { DeleteImportedEmployeeAttendanceByPresents } from "./delete-imported-attendance-by-presents";
import { UpdateImportedEmployeeAttendanceByPresents } from "./update-imported-attendance-by-presents";

export const ImportedEmployeeAttendanceByPresentsOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportEmployeeAttendanceByPresentsDataType;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <UpdateImportedEmployeeAttendanceByPresents
            indexToUpdate={index}
            dataToUpdate={data}
          />
          <DropdownMenuSeparator />
          <DeleteImportedEmployeeAttendanceByPresents indexToDelete={index} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
