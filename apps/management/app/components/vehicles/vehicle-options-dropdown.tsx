import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteVehicle } from "./delete-vehicle";

export const VehicleOptionsDropdown = ({
  vehicle,
  triggerChild,
}: {
  vehicle: any;
  triggerChild: React.ReactElement;
}) => {
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DeleteVehicle vehicleId={vehicle.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
