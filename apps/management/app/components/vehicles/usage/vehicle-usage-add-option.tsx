import { useUser } from "@/utils/user";
import { Button } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import {
  attribute,
  modalSearchParamNames,
} from "@canny_ecosystem/utils/constant";
import { useNavigate, useSearchParams } from "@remix-run/react";

export function VehicleUsageAdd() {
  const { role } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className={cn(
            !hasPermission(role, `${createRole}:${attribute.vehicle_usage}`) &&
              "hidden",
          )}
        >
          <Button variant="outline" size="icon" className="h-10 w-[2.5rem]">
            <Icon name="plus" className="h-[18px] w-[18px]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={10} align="end">
          <DropdownMenuItem
            onClick={() => {
              navigate("create-vehicle-usage");
            }}
            className="space-x-2 flex items-center"
          >
            <Icon name="plus-circled" size="sm" />
            <span>Add Usage</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              searchParams.set(
                "step",
                modalSearchParamNames.import_vehicle_usage,
              );
              setSearchParams(searchParams);
            }}
            className="space-x-2 flex items-center"
          >
            <Icon name="import" size="sm" className="mb-0.5" />
            <span>Import/backfill</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
