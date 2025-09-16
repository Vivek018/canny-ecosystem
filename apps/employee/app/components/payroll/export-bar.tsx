import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDateTime } from "@canny_ecosystem/utils";
import Papa from "papaparse";

export function ExportBar({
  rows,
  data,
  className,
  totalNet,
}: {
  rows: number;
  data: any[];
  className: string;
  totalNet: number;
}) {
  function transformEmployeeData(employee: any) {
    const { month, year, present_days, overtime_hours } = employee;

    const emp = employee?.employee || {};
    const { employee_code, first_name, middle_name, last_name } = emp;
    const employee_name = [first_name, middle_name, last_name]
      .filter(Boolean)
      .join(" ");

    const salaryFields: Record<string, number> = {};
    for (const entry of employee.salary_entries?.salary_field_values ?? []) {
      const fieldName = entry?.payroll_fields?.name?.trim();
      const amount = entry?.amount ?? 0;

      if (fieldName) {
        salaryFields[fieldName] = amount;
      }
    }

    return {
      employee_code,
      employee_name,
      month,
      year,
      present_days,
      overtime_hours,
      ...salaryFields,
    };
  }

  function transformAllEmployees(employees: any[]) {
    return employees.map(transformEmployeeData);
  }
  const transformed = transformAllEmployees(data);

  const handleExport = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const csv = Papa.unparse(transformed);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;

    link.setAttribute(
      "download",
      `Salary Data - ${formatDateTime(Date.now())}`,
    );

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "z-40 fixed bottom-16 md:bottom-8 left-0 right-0 mx-auto h-14 w-max shadow-md rounded-full flex gap-10 justify-between items-center p-2 text-sm border dark:border-muted-foreground/30 bg-card text-card-foreground",
        className,
      )}
    >
      <div className="ml-2 flex items-center space-x-1 rounded-md">
        <p className="font-semibold">{rows} Employee Selected</p>
      </div>
      <div className="h-full tracking-wide font-medium rounded-full hidden md:flex justify-between items-center px-6 border dark:border-muted-foreground/30 ">
        Net Amount: <span className="ml-1.5">{totalNet}</span>
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
