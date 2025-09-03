import { useNavigate } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Button } from "@canny_ecosystem/ui/button";
import { useVehicleUsageStore } from "@/store/vehicle-usage";
import { ColumnVisibility } from "./column-visibility";
import { Icon } from "@canny_ecosystem/ui/icon";

export function VehicleUsageActions({ isEmpty }: { isEmpty: boolean }) {
  const { selectedRows } = useVehicleUsageStore();
  const navigate = useNavigate();
  return (
    <div className="gap-4 flex">
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
        <Button
          variant="muted"
          size="icon"
          className={cn(
            "h-10 w-10  border border-input",
            !selectedRows?.length && "hidden"
          )}
          disabled={!selectedRows.length}
          onClick={() => navigate("/vehicles/usage/analytics")}
        >
          <Icon name="chart" className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </div>
  );
}
