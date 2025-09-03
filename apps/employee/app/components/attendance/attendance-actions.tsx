import { AttendanceMenu } from "./attendance-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { useNavigate } from "@remix-run/react";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useAttendanceStore } from "@/store/attendance";
import { ColumnVisibility } from "./column-visibility";
import type {
  CompanyDatabaseRow,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";

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
    <div className="gap-4 flex">
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
        {/* <AttendanceEmailMenu
        selectedRows={selectedRows}
        companyName={companyName}
        companyAddress={companyAddress}
        emails={userEmails}
        columnVisibility={columnVisibility}
      /> */}
        <AttendanceMenu
          selectedRows={selectedRows as any}
          companyName={companyName}
          companyAddress={companyAddress}
        />
        <Button
          variant="muted"
          size="icon"
          className={cn(
            "h-10 w-10 border border-input",
            !selectedRows.length && "hidden"
          )}
          disabled={!selectedRows.length}
          onClick={() => navigate("/time-tracking/attendance/analytics")}
        >
          <Icon name="chart" className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </div>
  );
}
