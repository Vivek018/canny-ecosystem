import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import type { ImportPayrollDataType } from "@canny_ecosystem/supabase/queries";
import { DeleteImportedPayroll } from "./delete-imported-payroll";
import { UpdateImportedPayroll } from "./update-imported-payroll";

export const ImportedPayrollOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportPayrollDataType;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <UpdateImportedPayroll
            indexToUpdate={index}
            dataToUpdate={data}
          />
          <DropdownMenuSeparator />
          <DeleteImportedPayroll indexToDelete={index} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
