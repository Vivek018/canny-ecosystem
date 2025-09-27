import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { fixedDecimal, formatDateTime } from "@canny_ecosystem/utils";
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
      [key: (typeof ReimbursementsColumnIdArray)[number]]:
        | string
        | number
        | boolean;
    } = {};

    for (const key of ReimbursementsColumnIdArray) {
      if (columnVisibility[key] === false) {
        continue;
      }
      if (key === "employee_code") {
        exportedData[key] = element?.employees?.employee_code;
      } else if (key === "employee_name") {
        exportedData[key] =
          `${element?.employees?.first_name} ${element?.employees?.middle_name} ${element?.employees?.last_name}`;
      } else if (key === "user_id") {
        exportedData[key] = element?.users?.email ?? "";
      } else if (key === "project_name") {
        exportedData[key] =
          element?.employees?.work_details[0]?.sites?.projects?.name;
      } else if (key === "site_name") {
        exportedData[key] = element?.employees?.work_details[0]?.sites?.name;
      } else {
        exportedData[key] = element?.[key as keyof ReimbursementDataType] as
          | string
          | boolean
          | number;
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
        "z-40 fixed bottom-16  md:bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-10 justify-between items-center p-2 text-sm border dark:border-muted-foreground/30 bg-card text-card-foreground",
        className
      )}
    >
      <div className="ml-2 flex items-center space-x-1 rounded-md">
        <p className="font-semibold">{rows} Selected</p>
      </div>
      <div className="h-full flex justify-center items-center gap-2">
        <div className="h-full tracking-wide font-medium rounded-full hidden md:flex justify-between items-center px-6 border dark:border-muted-foreground/30 ">
          Amount: <span className="ml-1.5">{fixedDecimal(totalAmount)}</span>
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
