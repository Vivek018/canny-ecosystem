import type { EmployeeReportDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import type { VisibilityState } from "@tanstack/react-table";
import Papa from "papaparse";
import { sbReportColumnIdArray } from "./table/data-table-header";

export function ExportBar({
  rows,
  data,
  className,
  columnVisibility,
}: {
  rows: number;
  data: (EmployeeReportDataType & {
    start_range: string;
    end_range: string;
  })[];
  className: string;
  columnVisibility: VisibilityState;
}) {
  const toBeExportedData = data.map((element) => {
    const exportedData: {
      [key: (typeof sbReportColumnIdArray)[number]]: string | number | boolean;
    } = {};

    for (const key of sbReportColumnIdArray) {
      if (columnVisibility[key] === false) {
        continue;
      }
      if (key === "employee_code") {
        exportedData[key] = element?.employee_code;
      } else if (key === "employee_name") {
        exportedData[key] =
          `${element?.first_name} ${element?.middle_name} ${element?.last_name}`;
      } else if (key === "project") {
        exportedData[key] =
          element?.employee_project_assignment?.sites?.projects?.name;
      } else if (key === "site") {
        exportedData[key] =
          element?.employee_project_assignment?.sites?.name;
      } else if (key === "start_range") {
        exportedData[key] = element?.start_range;
      } else if (key === "end_range") {
        exportedData[key] = element?.end_range ?? "";
      } else {
        exportedData[key] = element[key as keyof EmployeeReportDataType] as string | boolean | number;
      }
    }

    return exportedData;
  });

  const handleExport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const csv = Papa.unparse(toBeExportedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;

    link.setAttribute(
      "download",
      `Statutory Bonus Monthly Report - ${formatDateTime(Date.now())}`,
    );

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "z-40 fixed bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-10 justify-between items-center p-2 text-sm border dark:border-muted-foreground/30 bg-card text-card-foreground",
        className,
      )}
    >
      <div className="ml-2 flex items-center space-x-1 rounded-md">
        <p className="font-semibold">{rows} Selected</p>
      </div>
      <div className="h-full flex justify-center items-center gap-2">
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
