import { useUser } from "@/utils/user";
import type { PayrollFieldsDatabaseRow } from "@canny_ecosystem/supabase/types";
import { Button } from "@canny_ecosystem/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { createRole, hasPermission } from "@canny_ecosystem/utils";
import {
  attribute,
  modalSearchParamNames,
} from "@canny_ecosystem/utils/constant";
import { useSearchParams } from "@remix-run/react";
import { AddSalaryEntrySheet } from "./add-salary-entry-sheet";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { AddPayrollFieldSheet } from "./add-payroll-field-sheet";

export function ImportDepartmentPayrollDialog({
  payrollFields,
  salaryEntry,
  payrollId,
  allSiteOptions,
  allEmployeeOptions,
}: {
  payrollId: string;
  salaryEntry: any[];
  payrollFields: PayrollFieldsDatabaseRow[];
  allSiteOptions: ComboboxSelectOption[];
  allEmployeeOptions: ComboboxSelectOption[];
}) {
  const { role } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={cn(
          !hasPermission(role, `${createRole}:${attribute.payroll}`) &&
            "hidden",
        )}
      >
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Icon name="plus" className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
        <AddSalaryEntrySheet
          triggerChild={
            <div className="h-8 space-x-2 flex items-center px-2 hover:bg-muted">
              <Icon name="plus-circled" size="sm" className="mb-0.5" />
              <span className="text-sm">Add Salary Entry</span>
            </div>
          }
          allEmployeeOptions={allEmployeeOptions}
          allSiteOptions={allSiteOptions}
          payrollFields={payrollFields}
          payrollId={payrollId}
          salaryEntry={salaryEntry}
        />
        <AddPayrollFieldSheet
          triggerChild={
            <div className="h-8 space-x-2 flex items-center px-2 hover:bg-muted">
              <Icon name="plus-circled" size="sm" className="mb-0.5" />
              <span className="text-sm">Add Payroll Field</span>
            </div>
          }
          payrollId={payrollId}
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            searchParams.set(
              "step",
              modalSearchParamNames.import_department_salary_payroll,
            );
            setSearchParams(searchParams);
          }}
          className="space-x-2 flex items-center"
        >
          <Icon name="import" size="sm" className="mb-0.5" />
          <span>Import Department Salary Payroll</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
