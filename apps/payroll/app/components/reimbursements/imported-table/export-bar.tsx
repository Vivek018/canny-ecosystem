import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDate, formatDateTime } from "@canny_ecosystem/utils";
import Papa from "papaparse";
import { useState } from "react";

export function ExportBar({
  rows,
  data,
  className,
  columnVisibility,
}: {
  rows: number;
  data: any;
  className: string;
  columnVisibility: any;
}) {
  const totalAmount = data.reduce(
    (sum: number, entry: any) => sum + entry.amount,
    0
  );

  const toBeExportedData = data.map(
    ({
      amount,
      status,
      submitted_date,
      is_deductible,
      users: { email },
      employee_name: {
        first_name,
        middle_name,
        last_name,
        employee_code,
        employee_project_assignment: {
          project_sites: {
            name: projectSiteName,
            projects: { name: projectName },
          },
        },
      },
    }: any) => {
      const exportedData: any = {};

      if (columnVisibility.employee_code !== false)
        exportedData.employee_code = employee_code;
      if (columnVisibility.employee_name !== false)
        exportedData.employee_name = `${first_name} ${middle_name} ${last_name}`;
      if (columnVisibility.submitted_date !== false)
        exportedData.submitted_date = submitted_date;
      if (columnVisibility.amount !== false) exportedData.amount = amount;
      if (columnVisibility.status !== false) exportedData.status = status;
      if (columnVisibility.is_deductible !== false)
        exportedData.is_deductible = is_deductible;
      if (columnVisibility.email !== false) exportedData.email = email;
      if (columnVisibility.project_name !== false)
        exportedData.project_name = projectName;
      if (columnVisibility.project_site_name !== false)
        exportedData.project_site_name = projectSiteName;

      return exportedData;
    }
  );

  const handleExport = () => {
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
        "w-full fixed bottom-8 mx-auto flex gap-3 justify-center items-center",
        className
      )}
    >
      <div className="h-14 font-semibold shadow-md rounded-full flex justify-between items-center px-4 border bg-card text-card-foreground">
        Amount: <span className="ml-1.5">{totalAmount}</span>
      </div>
      <div className="h-14 shadow-md rounded-full flex gap-10 justify-between items-center px-3 border bg-card text-card-foreground">
        <span className="flex items-center space-x-1 bg-dark rounded-md">
          <p className="font-semibold">{rows} Selected</p>
        </span>
        <Button
          onClick={handleExport}
          variant="default"
          className="rounded-full"
        >
          Export
        </Button>
      </div>
    </div>
  );
}
