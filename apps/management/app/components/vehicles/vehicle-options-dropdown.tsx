import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";
import { DeleteVehicle } from "./delete-vehicle";
import { useSubmit } from "@remix-run/react";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

export const VehicleOptionsDropdown = ({
  vehicle,
  triggerChild,
}: {
  vehicle: any;
  triggerChild: React.ReactElement;
}) => {
  const submit = useSubmit();
  const { role } = useUser();

  const handleIncident = () => {
    submit(
      {
        id: vehicle.id,
      },
      {
        method: "POST",
        action: `/events/incidents/${vehicle.id}/create-incident-vehicle`,
      }
    );
  };
  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              !hasPermission(role, `${createRole}:${attribute.incidents}`) &&
                "hidden"
            )}
            onClick={handleIncident}
          >
            Report Incident
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              !hasPermission(role, `${createRole}:${attribute.incidents}`) &&
                "hidden"
            )}
          />
          <DeleteVehicle vehicleId={vehicle.id} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
