import { AttendanceMenu } from "./attendance-menu";
import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import { Link, useNavigate } from "@remix-run/react";
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
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2 px-4 border-r border-dashed border-muted-foreground/80">
      <ColumnVisibility disabled={isEmpty} />
      {/* <AttendanceEmailMenu
        selectedRows={selectedRows}
        companyName={companyName}
        companyAddress={companyAddress}
        emails={userEmails}
        columnVisibility={columnVisibility}
      /> */}
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
      <Link to="/chat/chatbox/attendance" className={cn(buttonVariants({ variant: "gradiant" }), "flex items-center justify-center gap-2 h-10")}>
        <Icon name="magic" size="xs" />
        <p>AI Chat</p>
      </Link>
    </div>
  );
}
