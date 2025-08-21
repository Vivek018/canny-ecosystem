import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import { DeleteImportedVehicleUsage } from "./delete-imported-vehicle-usage";
import type { ImportVehicleUsageDataType } from "@canny_ecosystem/supabase/queries";
import { UpdateImportedVehicleUsage } from "./update-imported-vehicle-usage";

export const ImportedVehicleUsageOptionsDropdown = ({
  index,
  data,
  triggerChild,
}: {
  index: number;
  data: ImportVehicleUsageDataType;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <UpdateImportedVehicleUsage
            indexToUpdate={index}
            dataToUpdate={data}
          />
          <DropdownMenuSeparator />
          <DeleteImportedVehicleUsage indexToDelete={index} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
