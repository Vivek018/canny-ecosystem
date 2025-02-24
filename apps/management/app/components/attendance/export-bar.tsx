import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDate, formatDateTime } from "@canny_ecosystem/utils";
import { months } from "@canny_ecosystem/utils/constant";
import type { VisibilityState } from "@tanstack/react-table";
import Papa from "papaparse";
import { useEffect, useState } from "react";

export function ExportBar({
  rows,
  data,
  className,
  fMonth,
  fYear,
  columnVisibility,
}: {
  rows: number;
  data: any;
  className: string;
  fMonth: string | undefined | null;
  fYear: string | undefined | null;
  columnVisibility: VisibilityState;
}) {
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const currentDate = new Date(year, month, i + 1);
    currentDate.setHours(12, 0, 0, 0);
    return {
      day: i + 1,
      fullDate: currentDate.toISOString().split("T")[0],
    };
  });
  useEffect(() => {
    if (fMonth && months[fMonth] !== undefined) {
      setMonth(months[fMonth] - 1);
    }
    if (fYear && Number(fYear)) {
      setYear(Number(fYear));
    }
  }, [fMonth, fYear]);

  const formattedData = data.map(
    (entry: {
      [x: string]: string;
      employee_code: string;
      employee_name: string;
      project: string;
      project_site: string;
    }) => {
      const formattedEntry: any = {};

      for (const key of [
        "employee_code",
        "employee_name",
        "project",
        "project_site",
      ]) {
        if (columnVisibility[key] !== false) {
          formattedEntry[key] = entry[key];
        }
      }

      // biome-ignore lint/complexity/noForEach: <explanation>
      days.forEach(({ fullDate }) => {
        const formattedDate = formatDate(fullDate);
        if (columnVisibility[formattedDate!] !== false) {
          formattedEntry[formattedDate!] = entry[formattedDate!] || "";
        }
      });

      return formattedEntry;
    }
  );

  function calculateMonthlyAvgPresence(data: any) {
    let totalDays = 0;
    let totalP = 0;

    for (const employee of data) {
      for (const key in employee) {
        if (
          ![
            "employee_code",
            "employee_name",
            "project",
            "project_site",
          ].includes(key)
        ) {
          totalDays++;
          if (employee[key] === "P") {
            totalP++;
          }
        }
      }
    }

    return totalDays > 0 ? (totalP / (totalDays / data.length)).toFixed(2) : 0;
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
      `Attendances - ${formatDateTime(Date.now())}`
    );

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "z-40 fixed bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-10 justify-between items-center p-2 text-sm border dark:border-muted-foreground/30 bg-card text-card-foreground",
        className
      )}
    >
      <div className="ml-2 flex items-center space-x-1 rounded-md">
        <p className="font-semibold">{rows} Selected</p>
      </div>
      <div className="h-full flex justify-center items-center gap-2">
        <div className="h-full tracking-wide font-medium rounded-full flex justify-between items-center px-6 border dark:border-muted-foreground/30 ">
          Avg Presents:{" "}
          <span className="ml-1.5">
            {calculateMonthlyAvgPresence(formattedData)}
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
