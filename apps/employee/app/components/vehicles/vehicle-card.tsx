import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@canny_ecosystem/ui/tooltip";
import { Link } from "@remix-run/react";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  formatDate,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { VehiclesDatabaseRow } from "@canny_ecosystem/supabase/types";

export function VehicleCard({
  vehicle,
}: {
  vehicle: Omit<VehiclesDatabaseRow, "created_at">;
}) {
  const { role } = useUser();

  return (
    <Card
      key={vehicle.id}
      className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-start"
    >
      <CardHeader className="flex flex-row space-y-0 items-start justify-between p-4">
        <div className="flex flex-col items-start gap-1">
          <CardTitle className="text-lg tracking-wide gap-1 hover:text-primary cursor-pointer">
            <Link to={`/vehicles/vehicle/${vehicle.id}/overview`}>
              {vehicle?.registration_number}
            </Link>
          </CardTitle>
          <div className="flex gap-1.5">
            <div className="text-[10px] font-light px-1.5 bg-muted-foreground text-muted rounded-sm">
              {replaceUnderscore(vehicle?.name ?? "")}
            </div>
            <div className="text-[10px] font-light px-1.5 bg-muted capitalize text-muted-foreground rounded-sm">
              {vehicle?.vehicle_type}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link
                  prefetch="intent"
                  to={`${vehicle.id}/update-vehicle`}
                  className={cn(
                    "p-2 rounded-md bg-secondary grid place-items-center",
                    !hasPermission(
                      role,
                      `${updateRole}:${attribute.vehicles}`,
                    ) && "hidden",
                  )}
                >
                  <Icon name="edit" size="xs" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardFooter
        className={cn(
          "mx-4 mb-1.5 mt-auto p-0 py-1.5 text-foreground text-xs flex gap-1 justify-between font-semibold",
        )}
      >
        <p
          className={cn(
            "text-green bg-green/25 rounded-md p-1 flex items-center gap-1 capitalize",
            !formatDate(vehicle?.start_date) && "hidden",
          )}
        >
          <Icon name="clock" size="xs" className="scale-x-[-1]" />
          {formatDate(vehicle?.start_date)}
        </p>
        <p
          className={cn(
            "text-destructive bg-destructive/25 rounded-md flex items-center gap-1 p-1 capitalize",
            !formatDate(vehicle?.end_date) && "hidden",
          )}
        >
          <Icon name="clock" size="xs" />
          {formatDate(vehicle?.end_date)}
        </p>
      </CardFooter>
    </Card>
  );
}
