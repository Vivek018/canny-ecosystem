import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import type { ImportEmployeeAddressDataType } from "@canny_ecosystem/supabase/queries";
import { DeleteImportedEmployee } from "./delete-imported-employee-address";
import { UpdateImportedEmployee } from "./update-imported-employee-address";

export const ImportedEmployeeOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportEmployeeAddressDataType;
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
