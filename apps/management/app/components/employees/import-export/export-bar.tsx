import type { EmployeeDataType } from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import type { VisibilityState } from "@tanstack/react-table";
import Papa from "papaparse";
import { employeeColumnIdArray } from "../table/data-table-header";

export function ExportBar({
  rows,
  data,
  className,
  columnVisibility,
}: {
  rows: number;
  data: EmployeeDataType[];
  className: string;
  columnVisibility: VisibilityState;
}) {
  const totalActive = data.reduce(
    (count: number, { is_active }) => count + (is_active ? 1 : 0),
    0
  );

  const toBeExportedData = data.map((element) => {
    const exportedData: {
      [key: (typeof employeeColumnIdArray)[number]]: string | number | boolean;
    } = {};

    for (const key of employeeColumnIdArray) {
      if (columnVisibility[key] === false) {
        continue;
      }
      if (key === "employee_code") {
        exportedData[key] = element?.employee_code;
      } else if (key === "first_name") {
        exportedData[key] =
          `${element?.first_name} ${element?.middle_name} ${element?.last_name}`;
      } else if (key === "mobile_number") {
        exportedData[key] = element?.primary_mobile_number;
      } else if (key === "date_of_birth") {
        exportedData[key] = element?.date_of_birth;
      } else if (key === "education") {
        exportedData[key] = element?.education ?? "";
      } else if (key === "gender") {
        exportedData[key] = element?.gender;
      } else if (key === "status") {
        exportedData[key] = element?.is_active ? "Active" : "Inactive";
      } else if (key === "project_name") {
        exportedData[key] = element?.work_details[0]?.sites?.projects?.name;
      } else if (key === "site_name") {
        exportedData[key] = element?.work_details[0]?.sites?.name;
      } else if (key === "assignment_type") {
        exportedData[key] = element?.work_details[0]?.assignment_type ?? "";
      } else if (key === "position") {
        exportedData[key] = element?.work_details[0]?.position!;
      } else if (key === "skill_level") {
        exportedData[key] = element?.work_details[0]?.skill_level ?? "";
      } else if (key === "start_date") {
        exportedData[key] = element?.work_details[0]?.start_date!;
      } else if (key === "end_date") {
        exportedData[key] = element?.work_details[0]?.end_date ?? "";
      } else if (key === "account_number") {
        exportedData[key] =
          element?.employee_bank_details?.account_number ?? "";
      } else if (key === "bank_name") {
        exportedData[key] = element?.employee_bank_details?.bank_name ?? "";
      } else if (key === "aadhaar_number") {
        exportedData[key] =
          element?.employee_statutory_details?.aadhaar_number ?? "";
      } else if (key === "pan_number") {
        exportedData[key] =
          element?.employee_statutory_details?.pan_number ?? "";
      } else if (key === "uan_number") {
        exportedData[key] =
          element?.employee_statutory_details?.uan_number ?? "";
      } else if (key === "pf_number") {
        exportedData[key] =
          element?.employee_statutory_details?.pf_number ?? "";
      } else if (key === "esic_number") {
        exportedData[key] =
          element?.employee_statutory_details?.esic_number ?? "";
      } else {
        exportedData[key] = element[key as keyof EmployeeDataType] as
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

    link.setAttribute("download", `Employees - ${formatDateTime(Date.now())}`);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "z-40 fixed bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-6 justify-between items-center p-2 text-sm border dark:border-muted-foreground/30 bg-card text-card-foreground",
        className
      )}
    >
      <div className="ml-2 flex items-center space-x-1 rounded-md">
        <p className="font-semibold">{rows} Selected</p>
      </div>
      <div className="h-full flex justify-center items-center gap-2">
        <div className="h-full tracking-wide font-medium rounded-full hidden md:flex justify-between items-center px-6 border dark:border-muted-foreground/30 ">
          Active: <span className="ml-1.5">{totalActive}</span>
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
