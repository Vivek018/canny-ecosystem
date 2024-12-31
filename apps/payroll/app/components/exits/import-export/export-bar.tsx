import type { ExitDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import { exitPaymentFields } from "@canny_ecosystem/utils/constant";
import type { VisibilityState } from "@tanstack/react-table";
import Papa from "papaparse";
import { ExitPaymentColumnIdArray } from "../table/data-table-header";

export function ExportBar({
  rows,
  data,
  className,
  columnVisibility,
}: {
  rows: number;
  data: ExitDataType[];
  className: string;
  columnVisibility: VisibilityState;
}) {
  const totalAmount = data.reduce(
    (sum: number, { total }) => sum + (total ?? 0),
    0,
  );

  const toBeExportedData = data.map((element) => {
    const employee_name =
      `${element.employees.first_name} ${element.employees.middle_name} ${element.employees.last_name}`.trim();

    const exportedData: any = {};

    for (const key of ExitPaymentColumnIdArray) {
      if (columnVisibility[key] === false) {
        continue;
      }

      if (key === "employee_code") {
        exportedData.employee_code = element.employees.employee_code;
      } else if (key === "employee_name") {
        exportedData.employee_name = employee_name;
      } else if (key === "project") {
        exportedData.project_name =
          element.employees.employee_project_assignment.project_sites.projects.name;
      } else if (key === "project_site") {
        exportedData.project_site_name =
          element.employees.employee_project_assignment.project_sites.name;
      } else {
        exportedData[key] = element[key as keyof ExitDataType];
      }
    }

    for (const field of exitPaymentFields) {
      const payment = element.exit_payments.find(
        (p) => p.payment_fields.name === field,
      );

      const mappedKey = field.replace(/\s/g, "_").toLowerCase();

      if (columnVisibility[mappedKey] !== false) {
        exportedData[mappedKey] = payment?.amount;
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
    link.setAttribute("download", `Exits - ${formatDateTime(Date.now())}`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div
      className={cn(
        "z-50 fixed bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-10 justify-between items-center px-3 border bg-accent text-accent-foreground",
        className,
      )}
    >
      <div className="ml-2 flex items-center space-x-1 bg-dark rounded-md">
        <p className="font-semibold">{rows} Selected</p>
      </div>
      <div className="flex justify-center items-center gap-2">
        <div className="h-10 text-[16px] tracking-wide font-medium rounded-full flex justify-between items-center px-6 border bg-card text-card-foreground">
          Amount: <span className="ml-1.5">{totalAmount}</span>
        </div>
        <Button
          onClick={handleExport}
          variant="default"
          size="lg"
          className="rounded-full"
        >
          Export
        </Button>
      </div>
    </div>
  );
}
