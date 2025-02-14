import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import { DeleteImportedExit } from "./delete-imported-exit";
import type { ImportExitDataType } from "@canny_ecosystem/supabase/queries";
import { UpdateImportedExit } from "./update-imported-exit";

export const ImportedExitOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportExitDataType;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <UpdateImportedExit
            indexToUpdate={index}
            dataToUpdate={data}
          />
          <DropdownMenuSeparator />
          <DeleteImportedExit indexToDelete={index} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
