import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import type { ImportEmployeePersonalsDataType } from "@canny_ecosystem/supabase/queries";
import { DeleteImportedEmployee } from "./delete-imported-employee-personals";
import { UpdateImportedEmployee } from "./update-imported-employee-personals";

export const ImportedEmployeeOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportEmployeePersonalsDataType;
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
