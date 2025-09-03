import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@canny_ecosystem/ui/dropdown-menu";

import { useNavigate } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  createRole,
  deleteRole,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { DeleteVehicleUsage } from "./delete-vehicle-usage";

export const VehicleUsageOptionsDropdown = ({
  vehicleUsageId,
  vehicleId,
  triggerChild,
}: {
  vehicleUsageId: string;
  vehicleId: string;
  triggerChild: React.ReactElement;
}) => {
  const { role } = useUser();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/vehicles/usage/${vehicleUsageId}/update-vehicle-usage`);
  };

  const handleCreateReimbursement = () => {
    navigate(`/vehicles/usage/${vehicleUsageId}/create-reimbursements`);
  };

  return (
    <DropdownMenu>
      {triggerChild}
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className={cn(
              "hidden",
              hasPermission(role, `${createRole}:${attribute.vehicle_usage}`) &&
                "flex"
            )}
            onClick={handleCreateReimbursement}
          >
            Create Reimbursement
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${createRole}:${attribute.vehicle_usage}`) &&
                "flex"
            )}
          />
          <DropdownMenuItem
            onClick={handleEdit}
            className={cn(
              "hidden",
              hasPermission(role, `${updateRole}:${attribute.vehicle_usage}`) &&
                "flex"
            )}
          >
            Update Usage
          </DropdownMenuItem>
          <DropdownMenuSeparator
            className={cn(
              "hidden",
              hasPermission(role, `${deleteRole}:${attribute.vehicle_usage}`) &&
                "flex"
            )}
          />
          <DeleteVehicleUsage id={vehicleUsageId} vehicleId={vehicleId} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
