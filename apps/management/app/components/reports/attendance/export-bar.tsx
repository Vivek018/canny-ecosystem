import type { AttendanceReportDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import type { VisibilityState } from "@tanstack/react-table";
import Papa from "papaparse";

export function ExportBar({
  rows,
  data,
  className,
  columnVisibility,
  monthYearsRange,
}: {
  rows: number;
  data: AttendanceReportDataType[];
  className: string;
  columnVisibility: VisibilityState;
  monthYearsRange: any;
}) {
  function transformEmployeeData(
    data: any[],
    columnVisibility: Record<string, boolean>
  ) {
    const toBeExportedData = data.map((element) => {
      const exportedData: {
        [key: string]: string | number | boolean | undefined;
      } = {};

      if (columnVisibility.employee_code !== false) {
        exportedData.employee_code = element.employee_code;
      }

      if (columnVisibility.employee_name !== false) {
        const firstName = element.first_name || "";
        const middleName = element.middle_name ? ` ${element.middle_name}` : "";
        const lastName = element.last_name ? ` ${element.last_name}` : "";
        exportedData.employee_name =
          `${firstName}${middleName}${lastName}`.trim();
      }

      if (columnVisibility.project !== false) {
        exportedData.project =
          element.work_details[0]?.sites?.projects?.name || null;
      }

      if (columnVisibility.site !== false) {
        exportedData.site = element.work_details[0]?.sites?.name || null;
      }

      if (element.attendance) {
        for (const monthYear of monthYearsRange) {
          if (columnVisibility[monthYear] !== false) {
            exportedData[monthYear] =
              element.attendance[monthYear]?.length || null;
          }
        }
      }
      if (columnVisibility.start_range !== false) {
        exportedData.start_range = monthYearsRange[0];
      }
      if (columnVisibility.end_range !== false) {
        exportedData.end_range = monthYearsRange[monthYearsRange.length - 1];
      }

      for (const key in columnVisibility) {
        if (columnVisibility[key] === false) {
          continue;
        }

        if (
          key === "employee_code" ||
          key === "employee_name" ||
          key === "project" ||
          key === "site" ||
          key === "start_range" ||
          key === "end_range" ||
          (element.attendance && key in element.attendance)
        ) {
          continue;
        }

        if (key in element) {
          exportedData[key] = element[key];
        }
      }

      return exportedData;
    });

    return toBeExportedData;
  }

  const formattedData = transformEmployeeData(data, columnVisibility);

  function calculateAvgPresenceByEmployees(data: any) {
    let totalDays = 0;
    const totalEmployees = data.length;

    for (const employee of data) {
      for (const key in employee) {
        if (
          key.endsWith("2025") &&
          !["start_range", "end_range"].includes(key)
        ) {
          totalDays += employee[key] ?? 0;
        }
      }
    }

    return totalEmployees > 0 ? (totalDays / totalEmployees).toFixed(2) : "0";
  }
  const handleExport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;

    link.setAttribute(
      "download",
      `Attendance Report - ${formatDateTime(Date.now())}`
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
          Avg Present:{" "}
          <span className="ml-1.5">
            {calculateAvgPresenceByEmployees(formattedData)}
          </span>
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
