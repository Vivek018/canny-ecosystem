import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import type { ImportEmployeeDataType } from "@canny_ecosystem/supabase/queries";
import { DeleteImportedEmployee } from "./delete-imported-employee";
import { UpdateImportedEmployee } from "./update-imported-employee";

export const ImportedEmployeeOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportEmployeeDataType;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <UpdateImportedEmployee indexToUpdate={index} dataToUpdate={data} />
          <DropdownMenuSeparator />
          <DeleteImportedEmployee indexToDelete={index} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
