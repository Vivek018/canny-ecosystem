import { useNavigate } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState } from "react";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { useVehicleUsageStore } from "@/store/vehicle-usage";
import { ColumnVisibility } from "./column-visibility";
import { VehicleUsageAdd } from "./vehicle-usage-add-option";

export function VehicleUsageActions({
  isEmpty,
  env,
}: {
  isEmpty: boolean;
  env: any;
}) {
  // const { selectedRows } = useVehicleUsageStore();

  return (
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
        <VehicleUsageAdd />

        {/* <ReimbursementMenu
          env={env}
          selectedRows={selectedRows}
          className={cn(
            buttonVariants({ variant: "muted", size: "icon" }),
            "h-10 w-10  border border-input",
            !selectedRows.length && "hidden"
          )}
        /> */}
      </div>
    </div>
  );
}
