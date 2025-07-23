import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { SearchableSelectField } from "@canny_ecosystem/ui/forms";
import { Form } from "@remix-run/react";
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
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { FormButtons } from "../../../form/form-buttons";
import { SalaryEntrySiteDepartmentSchema } from "@canny_ecosystem/utils";
import { useState } from "react";
import type { EmployeeDatabaseRow } from "@canny_ecosystem/supabase/types";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export function SalaryEntrySiteDepartmentSheet({
  triggerChild,
  salaryEntry,
  employee,
  payrollId,
  allDepartmentOptions,
  allSiteOptions,
  editable,
}: {
  triggerChild: React.ReactNode;
  salaryEntry: any;
  editable: boolean;
  employee: EmployeeDatabaseRow;
  payrollId: string;
  allSiteOptions: ComboboxSelectOption[];
  allDepartmentOptions: ComboboxSelectOption[];
}) {
  const name = `${employee?.first_name} ${employee?.middle_name ?? ""} ${
    employee?.last_name ?? ""
  }`;

  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: "UPDATE_SALARY_ENTRY",
    constraint: getZodConstraint(SalaryEntrySiteDepartmentSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SalaryEntrySiteDepartmentSchema,
      });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      id: salaryEntry?.id, //
      site_id: salaryEntry?.site_id ?? "",
      department_id: salaryEntry?.department_id ?? "",
    },
  });

  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (salaryEntry.length) {
      setOpen(true);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        asChild
        className={cn("cursor-pointer py-2", !salaryEntry && "cursor-default")}
        onClick={handleClick}
      >
        {triggerChild}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-[600px] h-full">
        <SheetHeader className="px-6 pt-4 pb-8 flex-shrink-0">
          <SheetTitle className="flex justify-between">
            <div>
              <h1 className="text-primary text-3xl">{name}</h1>
              <h4 className="my-1 text-muted-foreground text-sm">
                Employee Code: {employee?.employee_code ?? "--"}
              </h4>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <FormProvider context={form.context}>
            <Form
              method="POST"
              {...getFormProps(form)}
              className="flex flex-col"
              action={`/payroll/run-payroll/${payrollId}/${salaryEntry?.id}/update-salary-entry`}
            >
              <input
                {...getInputProps(fields.id, {
                  type: "hidden",
                })}
              />
              <SearchableSelectField
                key={resetKey + 1}
                className="capitalize"
                options={allSiteOptions}
                inputProps={{
                  ...getInputProps(fields.site_id, { type: "text" }),
                  readOnly: !editable,
                }}
                placeholder={"Select Site"}
                labelProps={{
                  children: "Site",
                }}
                errors={fields.site_id.errors}
              />
              <SearchableSelectField
                key={resetKey + 1}
                className="capitalize"
                options={allDepartmentOptions ?? []}
                inputProps={{
                  ...getInputProps(fields.department_id, { type: "text" }),
                  readOnly: !editable,
                }}
                placeholder={"Select Department"}
                labelProps={{
                  children: "Department",
                }}
                errors={fields.department_id.errors}
              />
            </Form>
          </FormProvider>
        </div>
        <SheetFooter className="mt-auto flex-shrink-0">
          <SheetClose asChild>
            <FormButtons
              form={form}
              setResetKey={setResetKey}
              isSingle={true}
              className={cn(!editable && "hidden")}
            />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
