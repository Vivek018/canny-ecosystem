import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import type { ImportEmployeeBankingDataType } from "@canny_ecosystem/supabase/queries";
import { DeleteImportedEmployee } from "./delete-imported-employee-banking";
import { UpdateImportedEmployee } from "./update-imported-employee-banking";

export const ImportedEmployeeOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportEmployeeBankingDataType;
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
