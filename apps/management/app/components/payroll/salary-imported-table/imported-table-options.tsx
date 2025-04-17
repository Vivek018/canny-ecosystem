import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "@canny_ecosystem/ui/dropdown-menu";

import { DeleteImportedPayroll } from "./delete-imported-payroll";
import type { ImportSalaryPayrollDataType } from "@canny_ecosystem/supabase/queries";

export const ImportedSalaryPayrollOptionsDropdown = ({
  index,
  triggerChild,
}: {
  index: number;
  data: ImportSalaryPayrollDataType;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DeleteImportedPayroll indexToDelete={index} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
