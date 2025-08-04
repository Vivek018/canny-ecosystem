import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@canny_ecosystem/ui/sheet";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState } from "react";
import type { PayrollFieldsDatabaseRow } from "@canny_ecosystem/supabase/types";
import {
  Combobox,
  type ComboboxSelectOption,
} from "@canny_ecosystem/ui/combobox";
import { Label } from "@canny_ecosystem/ui/label";
import { Input } from "@canny_ecosystem/ui/input";
import { Button } from "@canny_ecosystem/ui/button";
import { useSearchParams, useSubmit } from "@remix-run/react";

export function AddSalaryEntrySheet({
  triggerChild,
  salaryEntry,
  allEmployeeOptions,
  payrollFields,
  payrollId,
  allSiteOptions,
}: {
  triggerChild: React.ReactNode;
  salaryEntry: any;
  payrollFields: PayrollFieldsDatabaseRow[];
  payrollId: string;
  allSiteOptions: ComboboxSelectOption[];
  allEmployeeOptions: ComboboxSelectOption[];
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const [site, setSite] = useState("");
  const [employee, setEmployee] = useState("");
  const [presents, setPresents] = useState("");

  const [fieldConfigs, setFieldConfigs] = useState(() =>
    payrollFields.map((field) => ({
      id: field.id,
      key: field.name,
      type: field.type,
      amount: 0,
    })),
  );

  const handleFinalSubmit = () => {
    const finalData = {
      employee_id: employee,
      present_days: presents,
      salary_data: fieldConfigs,
    };
    submit(
      {
        payrollId: payrollId,
        salaryEntryData: JSON.stringify(finalData),
        failedRedirect: `/payroll/run-payroll/${payrollId}`,
      },
      {
        method: "POST",
        action: `/payroll/run-payroll/${payrollId}/add-salary-entry`,
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        asChild
        className={cn("cursor-pointer py-2", !salaryEntry && "hidden")}
      >
        {triggerChild}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-[600px] h-full">
        <SheetHeader className="px-6 pt-4 pb-8 flex-shrink-0">
          <SheetTitle className="flex justify-between">
            <div>
              <h1 className="text-primary text-3xl">Add Salary Entry</h1>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="mb-8 flex flex-col gap-1">
            <Label className="text-sm font-medium">Site</Label>
            <Combobox
              options={allSiteOptions}
              placeholder="Select Site first for employees"
              value={site}
              onChange={(value: string) => {
                if (value?.length) {
                  searchParams.set("site", value);
                  setSite(value);
                }
                setSearchParams(searchParams);
              }}
            />
          </div>
          <div className="w-full grid grid-cols-2 gap-4 mb-8">
            <div className="mb-8 flex flex-col gap-1">
              <Label className="text-sm font-medium">Employee</Label>
              <Combobox
                options={allEmployeeOptions}
                placeholder="Select Employee"
                value={employee}
                onChange={(value: string) => {
                  setEmployee(value);
                }}
              />
            </div>
            <div className="mb-8 flex flex-col gap-1">
              <Label className="text-sm font-medium">Present Days</Label>
              <Input
                placeholder="Enter the present days"
                onChange={(e) => setPresents(e.target.value)}
              />
            </div>
          </div>
          {fieldConfigs.map((field) => (
            <div key={field.key} className="flex flex-col relative gap-1">
              <div className="flex flex-row justify-between items-center">
                <div className="flex gap-1">
                  <label className="text-sm text-muted-foreground capitalize">
                    {field.key}
                  </label>
                </div>
              </div>

              <Input
                value={field.amount}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setFieldConfigs((prev) =>
                    prev.map((f) =>
                      f.key === field.key ? { ...f, amount: value } : f,
                    ),
                  );
                }}
                placeholder={"Enter Amount"}
              />
            </div>
          ))}
        </div>
        <SheetFooter className="mt-auto flex-shrink-0">
          <SheetClose asChild>
            <Button variant={"default"} onClick={handleFinalSubmit}>
              Add
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
