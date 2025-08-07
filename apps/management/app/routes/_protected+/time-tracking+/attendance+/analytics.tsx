import { useAttendanceStore } from "@/store/attendance";
import { AttendanceBars } from "@/components/attendance/analytics/attendance-bar";
import type { TransformedAttendanceDataType } from "./_index";
import { AttendanceAbsentees } from "@/components/attendance/analytics/attendance-absents";
import { AttendanceBySite } from "@/components/attendance/analytics/attendance-site";
import { AttendanceByProjects } from "@/components/attendance/analytics/attendance-project";
import { AttendanceTrend } from "@/components/attendance/analytics/attendance-trend";

export default function AttendanceAnalytics() {
  const { selectedRows } = useAttendanceStore();

  const transformedData: TransformedAttendanceDataType[] = selectedRows.map(
    (entry) => ({
      employee_id: entry?.id,
      employee_code: entry?.employee_code,
      employee_name: `${entry?.first_name} ${entry?.last_name}`,
      project: entry?.employee_project_assignment?.sites?.projects?.name,
      site: entry?.employee_project_assignment?.sites?.name,
      attendance_summary: {
        year: entry?.monthly_attendance?.year,
        month: entry?.monthly_attendance?.month,
        present_days: entry?.monthly_attendance?.present_days ?? 0,
        absent_days: entry?.monthly_attendance?.absent_days ?? 0,
        paid_leaves: entry?.monthly_attendance?.paid_leaves ?? 0,
        casual_leaves: entry?.monthly_attendance?.casual_leaves ?? 0,
        paid_holidays: entry?.monthly_attendance?.paid_holidays ?? 0,
        working_hours: entry?.monthly_attendance?.working_hours ?? 0,
        overtime_hours: entry?.monthly_attendance?.overtime_hours ?? 0,
      },
    })
  );

  return (
    <div className="w-full p-4 m-auto flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <AttendanceTrend chartData={transformedData} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AttendanceByProjects chartData={transformedData} />
        <AttendanceBySite chartData={transformedData} />

        <AttendanceAbsentees chartData={transformedData} />
      </div>
      <div className="col-span-1">
        <AttendanceBars chartData={transformedData} />
      </div>
    </div>
  );
}
