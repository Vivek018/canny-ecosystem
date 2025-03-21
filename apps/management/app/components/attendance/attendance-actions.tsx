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
import AttendanceEmailMenu from "./attendance-email-menu";

export function AttendanceActions({
  isEmpty,
  companyName,
  companyAddress,
  userEmails,
}: {
  isEmpty?: boolean;
  companyName?: CompanyDatabaseRow;
  companyAddress?: LocationDatabaseRow;
  userEmails: any[];
}) {
  const navigate = useNavigate();
  const { selectedRows, columnVisibility } = useAttendanceStore();
  return (
    <div className="space-x-2 hidden md:flex">
      <ColumnVisibility disabled={isEmpty} />
      <AttendanceEmailMenu
        selectedRows={selectedRows}
        companyName={companyName}
        companyAddress={companyAddress}
        emails={userEmails}
        columnVisibility={columnVisibility}
      />
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-10 w-10 bg-muted/70 text-muted-foreground",
          !selectedRows.length && "hidden"
        )}
        disabled={!selectedRows.length}
        onClick={() => navigate("/time-tracking/attendance/analytics")}
      >
        <Icon name="chart" className="h-[18px] w-[18px]" />
      </Button>
      <AttendanceMenu
        selectedRows={selectedRows}
        companyName={companyName}
        companyAddress={companyAddress}
      />
    </div>
  );
}
