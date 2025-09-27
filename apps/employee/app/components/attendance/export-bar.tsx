import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import type { VisibilityState } from "@tanstack/react-table";
import Papa from "papaparse";
import { AttendanceColumnIdArray } from "./table/attendance-table-header";

export function ExportBar({
  rows,
  data,
  className,
  columnVisibility,
}: {
  rows: number;
  data: any;
  className: string;
  columnVisibility: VisibilityState;
}) {
  const toBeExportedData = data.map((element: any) => {
    const exportedData: {
      [key: (typeof AttendanceColumnIdArray)[number]]:
        | string
        | number
        | boolean;
    } = {};

    for (const key of AttendanceColumnIdArray) {
      if (columnVisibility[key] === false) {
        continue;
      }
      if (key === "employee_code") {
        exportedData[key] = element?.employee_code;
      } else if (key === "first_name") {
        exportedData[key] =
          `${element?.first_name} ${element?.middle_name} ${element?.last_name}`;
      } else if (key === "project_name") {
        exportedData[key] = element?.work_details[0]?.sites?.projects?.name;
      } else if (key === "site_name") {
        exportedData[key] = element?.work_details[0]?.sites?.name;
      } else if (key === "month") {
        exportedData[key] = element?.monthly_attendance?.month;
      } else if (key === "year") {
        exportedData[key] = element?.monthly_attendance?.year;
      } else if (key === "present_days") {
        exportedData[key] = element?.monthly_attendance?.present_days;
      } else if (key === "absent_days") {
        exportedData[key] = element?.monthly_attendance?.absent_days;
      } else if (key === "working_days") {
        exportedData[key] = element?.monthly_attendance?.working_days;
      } else if (key === "working_hours") {
        exportedData[key] = element?.monthly_attendance?.working_hours;
      } else if (key === "overtime_hours") {
        exportedData[key] = element?.monthly_attendance?.overtime_hours;
      } else if (key === "paid_holidays") {
        exportedData[key] = element?.monthly_attendance?.paid_holidays;
      } else if (key === "paid_leaves") {
        exportedData[key] = element?.monthly_attendance?.paid_leaves;
      } else if (key === "casual_leaves") {
        exportedData[key] = element?.monthly_attendance?.casual_leaves;
      }
    }

    return exportedData;
  });

  function calculateAvgPresence(data: any) {
    let totalP = 0;
    let totalEmployees = 0;

    for (const employee of data) {
      const presentDays = employee.monthly_attendance?.present_days ?? 0;
      totalP += presentDays;
      totalEmployees++;
    }

    return totalEmployees > 0 ? (totalP / totalEmployees).toFixed(2) : "0";
  }

  const handleExport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const csv = Papa.unparse(toBeExportedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;

    link.setAttribute(
      "download",
      `Attendances - ${formatDateTime(Date.now())}`
    );

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "z-40 fixed bottom-16 md:bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-10 justify-between items-center p-2 text-sm border dark:border-muted-foreground/30 bg-card text-card-foreground",
        className
      )}
    >
      <div className="ml-2 flex items-center space-x-1 rounded-md">
        <p className="font-semibold">{rows} Selected</p>
      </div>
      <div className="h-full flex justify-center items-center gap-2">
        <div className="h-full tracking-wide font-medium rounded-full hidden md:flex justify-between items-center px-6 border dark:border-muted-foreground/30 ">
          Avg Present Days:{" "}
          <span className="ml-1.5">{calculateAvgPresence(data)}</span>
        </div>
        <Button
          onClick={handleExport}
          variant="default"
          size="lg"
          className="h-full rounded-full"
        >
          Export
        </Button>
      </div>
    </div>
  );
}
