import type { EmployeeMonthlyAttendanceDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Card, CardHeader, CardTitle } from "@canny_ecosystem/ui/card";
import { getMonthNameFromNumber } from "@canny_ecosystem/utils";

export default function AttendanceComponent({
  attendanceData,
}: {
  attendanceData: EmployeeMonthlyAttendanceDatabaseRow;
}) {
  return (
    <Card className="w-full select-text cursor-auto dark:border-[1.5px] h-full flex flex-col justify-between rounded-lg">
      <CardHeader className="py-2 px-3">
        <CardTitle className="font-bold capitalize text-xl text-center">
          {getMonthNameFromNumber(attendanceData.month)} {attendanceData.year}
        </CardTitle>
      </CardHeader>
      <hr />
      <div className="p-3 grid grid-cols-2 gap-6">
        <div className=" flex flex-col text-sm ">
          <div className="flex justify-between">
            <span>Working Days</span>
            <span className="font-medium text-muted-foreground">
              {attendanceData?.working_days ?? 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Working Hours</span>
            <span className="font-medium text-muted-foreground  ">
              {attendanceData?.working_hours ?? 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Absent Days</span>
            <span className="font-medium text-muted-foreground  ">
              {attendanceData?.absent_days ?? 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Paid Leaves</span>
            <span className="font-medium text-muted-foreground  ">
              {attendanceData?.paid_leaves ?? 0}
            </span>
          </div>
        </div>
        <div className=" flex flex-col text-sm ">
          <div className="flex justify-between">
            <span>Present Days</span>
            <span className="font-medium text-muted-foreground">
              {attendanceData?.present_days ?? 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Overtime Hours</span>
            <span className="font-medium text-muted-foreground  ">
              {attendanceData?.overtime_hours ?? 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Paid Holidays</span>
            <span className="font-medium text-muted-foreground  ">
              {attendanceData?.paid_holidays ?? 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Casual Leaves</span>
            <span className="font-medium text-muted-foreground  ">
              {attendanceData?.casual_leaves ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
