import { ImportAttendanceMenu } from "./import-attendance-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { useNavigate } from "@remix-run/react";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useAttendanceStore } from "@/store/attendance";
import { ColumnVisibility } from "./column-visibility";
import type { CompanyDatabaseRow, LocationDatabaseRow } from "@canny_ecosystem/supabase/types";

export function AttendanceActions({
  isEmpty,
  companyName,
  companyAddress,
}: {
  isEmpty?: boolean;
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
}) {
  const navigate = useNavigate();
  const { selectedRows } = useAttendanceStore();
  return (
    <div className="space-x-2 hidden md:flex">
      <Button
        variant="outline"
        size="icon"
        className={cn("h-10 w-10", !selectedRows.length && "hidden")}
        disabled={!selectedRows.length}
        onClick={() => navigate("/time-tracking/attendance/analytics")}
      >
        <Icon name="chart" className="h-[18px] w-[18px]" />
      </Button>
      <ColumnVisibility disabled={isEmpty} />
      <ImportAttendanceMenu
        selectedRows={selectedRows}
        companyName={companyName}
        companyAddress={companyAddress}
      />
    </div>
  );
}
