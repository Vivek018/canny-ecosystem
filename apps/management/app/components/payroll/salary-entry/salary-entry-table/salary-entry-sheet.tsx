import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { CheckboxField, Field, SearchableSelectField } from "@canny_ecosystem/ui/forms";
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
import { componentTypeArray, replaceUnderscore, SalaryEntrySchema, transformStringArrayIntoOptions } from "@canny_ecosystem/utils";
import { useState } from "react";
import type { EmployeeDatabaseRow, SalaryEntriesDatabaseRow } from "@canny_ecosystem/supabase/types";

export function SalaryEntrySheet({
  triggerChild,
  salaryEntry,
  employee,
  editable,
}: { triggerChild: React.ReactNode, salaryEntry: Omit<SalaryEntriesDatabaseRow, "created_at" | "updated_at">; employee: EmployeeDatabaseRow, editable: boolean }) {
  const name = `${employee?.first_name} ${employee?.middle_name ?? ""} ${employee?.last_name ?? ""
    }`;

  const [resetKey, setResetKey] = useState(Date.now());

  const [form, fields] = useForm({
    id: "UPDATE_SALARY_ENTRY",
    constraint: getZodConstraint(SalaryEntrySchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SalaryEntrySchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: salaryEntry,
  });

  return (
    <Sheet>
      <SheetTrigger asChild className="cursor-pointer py-2">
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

            <div className="flex flex-col items-end justify-around">
              <h2 className="text-xl text-muted-foreground">Net Pay</h2>
              <p className="font-bold">Rs {salaryEntry.amount}</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <FormProvider context={form.context}>
            <Form
              method="POST"
              {...getFormProps(form)}
              className="flex flex-col"
              action={`/payroll/run-payroll/${salaryEntry.payroll_id}/${salaryEntry.id}/update-salary-entry`}
            >
              <input
                {...getInputProps(fields.id, { type: "hidden" })}
              />
              <input
                {...getInputProps(fields.template_component_id, { type: "hidden" })}
              />
              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <input {...getInputProps(fields.payroll_id, { type: "hidden" })} />

              <Field
                inputProps={{
                  ...getInputProps(fields.field_name, { type: "text" }),
                  placeholder: "Enter field name",
                  className: "capitalize",
                  readOnly: true,
                }}
                labelProps={{
                  children: "Field Name",
                }}
                errors={fields.field_name.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.amount, { type: "number" }),
                  autoFocus: true,
                  placeholder: "Enter amount",
                  className: "capitalize",
                  readOnly: !editable,
                }}
                labelProps={{
                  children: "Amount",
                }}
                errors={fields.amount.errors}
              />
              <SearchableSelectField
                key={resetKey + 1}
                className="capitalize"
                options={transformStringArrayIntoOptions(componentTypeArray as unknown as string[])}
                inputProps={{
                  ...getInputProps(fields.type, { type: "text" }),
                  readOnly: !editable,
                }}
                placeholder={`Select ${replaceUnderscore(fields.type.name)}`}
                labelProps={{
                  children: replaceUnderscore(fields.type.name),
                }}
                errors={fields.type.errors}
              />
              <div className='grid grid-cols-2 place-content-center justify-between gap-x-4'>
                <CheckboxField
                  buttonProps={getInputProps(fields.is_pro_rata, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Calculate on pro-rata basis",
                  }}
                />

                <CheckboxField
                  buttonProps={getInputProps(fields.is_overtime, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Calculate on overtime basis",
                  }}
                />

                <CheckboxField
                  buttonProps={getInputProps(fields.consider_for_epf, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Consider for EPF Contribution",
                  }}
                />

                <CheckboxField
                  buttonProps={getInputProps(fields.consider_for_esic, {
                    type: "checkbox",
                  })}
                  labelProps={{
                    children: "Consider for ESI Contribution",
                  }}
                />
              </div>
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
