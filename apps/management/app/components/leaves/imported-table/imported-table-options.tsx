import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import { DeleteImportedLeaves} from "./delete-imported-leaves";
import type { ImportLeavesDataType } from "@canny_ecosystem/supabase/queries";
import { UpdateImportedLeaves } from "./update-imported-leaves";

export const ImportedLeavesOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportLeavesDataType;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <UpdateImportedLeaves indexToUpdate={index} dataToUpdate={data} />
          <DropdownMenuSeparator />
          <DeleteImportedLeaves indexToDelete={index} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
