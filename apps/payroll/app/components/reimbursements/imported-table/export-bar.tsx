import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import type { VisibilityState } from "@tanstack/react-table";
import Papa from "papaparse";
import { ReimbursementsColumnIdArray } from "../table/reimbursements-table-header";

export function ExportBar({
  rows,
  data,
  className,
  columnVisibility,
}: {
  rows: number;
  data: ReimbursementDataType[];
  className: string;
  columnVisibility: VisibilityState;
}) {
  const totalAmount = data.reduce(
    (sum: number, { amount }) => sum + (amount ?? 0),
    0
  );
  const toBeExportedData = data.map((element) => {
    const exportedData: {
      [key: (typeof ReimbursementsColumnIdArray)[number]]: string | number | boolean;
    } = {};

    for (const key of ReimbursementsColumnIdArray) {
      if (columnVisibility[key] === false) {
        continue;
      }
      if (key === "employee_code") {
        exportedData[key] = element.employee_name.employee_code;
      } else if (key === "employee_name") {
        exportedData[
          key
        ] = `${element.employee_name.first_name} ${element.employee_name.middle_name} ${element.employee_name.last_name}`;
      } else if (key === "email") {
        exportedData[key] = element.users.email ?? "";
      } else if (key === "project_name") {
        exportedData[key] =
          element.employee_name.employee_project_assignment.project_sites.projects.name;
      } else if (key === "project_site_name") {
        exportedData[key] =
          element.employee_name.employee_project_assignment.project_sites.name;
      } else {
        exportedData[key] = element[key as keyof ReimbursementDataType] as any;
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
      `Reimbursements - ${formatDateTime(Date.now())}`
    );

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "fixed bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-10 justify-between items-center px-3 border bg-card text-card-foreground",
        className
      )}
    >
      <div className="h-9 font-semibold rounded-full flex justify-between items-center px-4 border bg-card text-card-foreground">
        Amount: <span className="ml-1.5">{totalAmount}</span>
      </div>
      <div className="flex items-center space-x-1 bg-dark rounded-md">
        <p className="font-semibold">{rows} Selected</p>
      </div>
      <Button onClick={handleExport} variant="default" className="rounded-full">
        Export
      </Button>
    </div>
  );
}
