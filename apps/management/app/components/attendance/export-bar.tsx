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
}: {
  rows: number;
  data: any;
  className: string;
  columnVisibility: VisibilityState;
}) {
  const allHeaders = new Set<string>();
  const dateHeaders = new Set<string>();

  for (const entry of data) {
    for (const key of Object.keys(entry)) {
      if (columnVisibility[key] !== false) {
        allHeaders.add(key);
        if (
          ![
            "employee_id",
            "employee_code",
            "employee_name",
            "project",
            "site",
          ].includes(key)
        ) {
          dateHeaders.add(key);
        }
      }
    }
  }

  const sortedDateHeaders = [...dateHeaders].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  const formattedData: any[] | Papa.UnparseObject<any> = [];

  for (const entry of data) {
    const {
      employee_id,
      employee_code,
      employee_name,
      project,
      site,
      ...attendance
    } = entry;

    const fixedFields = { employee_code, employee_name, project, site };

    const formattedEntry: Record<string, string> = { ...fixedFields };

    for (const date of sortedDateHeaders) {
      const dayData = attendance[date];
      formattedEntry[date] = dayData ? `${dayData.present}` : "";
    }

    formattedData.push(formattedEntry);
  }

  function calculateMonthlyAvgPresence(data: any) {
    let totalDays = 0;
    let totalP = 0;

    for (const employee of data) {
      for (const key in employee) {
        if (
          !["employee_code", "employee_name", "project", "site"].includes(key)
        ) {
          if (employee[key] !== "WOF") {
            totalDays++;
            if (employee[key] === "P") {
              totalP++;
            }
          }
        }
      }
    }

    return totalDays > 0 ? ((totalP / totalDays) * 100).toFixed(2) : 0;
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
      `Attendances - ${formatDateTime(Date.now())}`,
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
        <div className="h-full tracking-wide font-medium rounded-full flex justify-between items-center px-6 border dark:border-muted-foreground/30 ">
          Avg Present Days:{" "}
          <span className="ml-1.5">
            {calculateMonthlyAvgPresence(formattedData)} %
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
