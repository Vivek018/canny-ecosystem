import { AttendanceMenu } from "./attendance-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { useNavigate, useSubmit } from "@remix-run/react";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useAttendanceStore } from "@/store/attendance";
import { ColumnVisibility } from "./column-visibility";
import type {
  CompanyDatabaseRow,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Input } from "@canny_ecosystem/ui/input";
import { Label } from "@canny_ecosystem/ui/label";
import {
  defaultYear,
  getYears,
  transformStringArrayIntoOptions,
} from "@canny_ecosystem/utils";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { useState } from "react";
import { Combobox } from "@canny_ecosystem/ui/combobox";
import { payoutMonths } from "@canny_ecosystem/utils/constant";

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
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [workingDays, setWorkingDays] = useState("");
  const submit = useSubmit();
  let updates: any[] = [];

  const handleUpdateBulkAttendances = () => {
    updates = selectedRows.map((entry: any) => {
      return {
        id: entry.monthly_attendance.id,
        month: month && month.trim() !== "" ? month : null,
        year: year && year.trim() !== "" ? year : null,
        working_days:
          workingDays && workingDays.trim() !== "" ? workingDays : null,
      };
    });

    clearCacheEntry(`${cacheKeyPrefix.attendance}`);
    submit(
      {
        attendancesData: JSON.stringify(updates),
        failedRedirect: "/time-tracking/attendance",
      },
      {
        method: "POST",
        action: "/time-tracking/attendance/update-bulk-attendances",
      },
    );
  };

  return (
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2">
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
            !selectedRows.length && "hidden",
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
        <div className="h-full">
          <AlertDialog>
            <AlertDialogTrigger
              className={cn(
                "h-10 w-10 bg-muted/70 text-muted-foreground rounded border border-input",
                !selectedRows.length && "hidden",
              )}
            >
              <Icon name="edit" className="h-[18px] w-[18px]" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Update Bulk Attendance</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Month</Label>
                  <Combobox
                    options={payoutMonths as unknown as any[]}
                    value={month}
                    onChange={(e) => setMonth(e)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-medium">Year</Label>
                  <Combobox
                    options={transformStringArrayIntoOptions(
                      getYears(25, defaultYear) as unknown as string[],
                    )}
                    value={year}
                    onChange={(e) => setYear(e)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Working Days</Label>
                <Input
                  type="number"
                  placeholder="Enter Working Days"
                  onChange={(e) => setWorkingDays(e.target.value)}
                />
              </div>
              <AlertDialogFooter className="pt-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={
                    !month?.length && !year?.length && !workingDays.length
                  }
                  className={cn(buttonVariants({ variant: "default" }))}
                  onClick={handleUpdateBulkAttendances}
                >
                  Update
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
