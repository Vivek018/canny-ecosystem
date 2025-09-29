import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@canny_ecosystem/ui/avatar";
import type {
  SupabaseEnv,
  VehiclesDatabaseRow,
} from "@canny_ecosystem/supabase/types";

export function VehiclePageHeader({
  vehicle,
}: {
  vehicle: VehiclesDatabaseRow;
  env: SupabaseEnv;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full flex flex-row gap-6 justify-between">
        <div className="flex flex-row gap-6 items-center">
          <div>
            <Avatar className="w-20 h-20 sm:w-28 sm:h-28 border border-muted-foreground/30 shadow-sm hover:z-40 cursor-pointer">
              <>
                <AvatarImage src={vehicle?.photo ?? undefined} />
                <AvatarFallback className="rounded-md">
                  <span className="text-base">{vehicle.name?.charAt(0)}</span>
                </AvatarFallback>
              </>
            </Avatar>
          </div>
          <div className="flex h-full flex-col items-start justify-start">
            <div
              className={cn(
                "rounded-sm flex items-center",
                vehicle.is_active ? "text-green" : "text-yellow-500",
              )}
            >
              <Icon name="dot-filled" className="mt-[1px]" />
              <p className={cn("ml-0.5 text-sm font-medium capitalize")}>
                {vehicle.is_active ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="mt-3">
              <h1 className="text:lg sm:text-3xl tracking-wide font-bold capitalize">
                {`${vehicle?.registration_number}`}
              </h1>
              <p className="w-max bg-muted text-sm text-muted-foreground px-1.5 pb-0.5 mt-0.5 rounded">
                {vehicle?.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
