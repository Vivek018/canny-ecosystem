import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import { DeleteImportedReimbursement } from "./delete-imported-reimbursement";
import type { ImportReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import { UpdateImportedReimbursement } from "./update-imported-reimbursement";

export const ImportedReimbursementOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportReimbursementDataType;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <UpdateImportedReimbursement
            indexToUpdate={index}
            dataToUpdate={data}
          />
          <DropdownMenuSeparator />
          <DeleteImportedReimbursement indexToDelete={index} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
