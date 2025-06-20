import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { Field } from "@canny_ecosystem/ui/forms";
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
import { TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { flexRender } from "@tanstack/react-table";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { FormButtons } from "../../../form/form-buttons";
import type { ExitsPayrollEntriesWithEmployee } from "@canny_ecosystem/supabase/queries";
import { ExitEntrySchema } from "@canny_ecosystem/utils";

export function ExitEntrySheet({
  row,
  rowData,
  editable,
  type,
}: {
  row: any;
  rowData: ExitsPayrollEntriesWithEmployee;
  editable: boolean;
  type: string;
}) {
  const name = `${rowData?.employees?.first_name} ${
    rowData?.employees?.middle_name ?? ""
  } ${rowData?.employees?.last_name ?? ""}`;

  const [form, fields] = useForm({
    id: "UPDATE_PAYROLL_ENTRY",
    constraint: getZodConstraint(ExitEntrySchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ExitEntrySchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...rowData,
      type: type,
    },
  });

  return (
    <Sheet>
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className="relative cursor-pointer select-text"
      >
        {row.getVisibleCells().map((cell: any) => {
          if (cell.column.id === "actions") {
            return (
              <TableCell
                key={cell.id}
                className={cn(
                  cell.column.id === "actions" &&
                    "sticky right-0 min-w-20 max-w-20 bg-card z-10"
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          }
          return (
            <SheetTrigger asChild key={cell.id}>
              <TableCell
                className={cn("px-3 md:px-4 py-4 hidden md:table-cell")}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            </SheetTrigger>
          );
        })}
      </TableRow>
      <SheetContent className="flex flex-col w-[600px] h-full">
        <SheetHeader className="px-6 pt-4 pb-8 flex-shrink-0">
          <SheetTitle className="flex justify-between">
            <div>
              <h1 className="text-primary text-3xl">{name}</h1>
              <h4 className="my-1 text-muted-foreground text-sm">
                Employee Code: {rowData?.employees?.employee_code ?? "--"}
              </h4>
            </div>

            <div className="flex flex-col items-end justify-around">
              <h2 className="text-xl text-muted-foreground">Net pay</h2>
              <p className="font-bold">
                Rs{" "}
                {Number(rowData?.gratuity) +
                  Number(rowData?.bonus) +
                  Number(rowData?.leave_encashment) -
                  Number(rowData?.deduction)}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <FormProvider context={form.context}>
            <Form
              method="POST"
              {...getFormProps(form)}
              className="flex flex-col"
              action={`/payroll/run-payroll/${rowData.payroll_id}/${rowData.id}/update-exit-entry`}
            >
              <input {...getInputProps(fields.type, { type: "hidden" })} />

              <input {...getInputProps(fields.id, { type: "hidden" })} />

              <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <input
                {...getInputProps(fields.payroll_id, { type: "hidden" })}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.gratuity, { type: "number" }),
                  autoFocus: true,
                  placeholder: "Enter Gratuity",
                  className: "capitalize",
                  readOnly: !editable,
                }}
                labelProps={{
                  children: "Gratuity",
                }}
                errors={fields.gratuity.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.bonus, { type: "number" }),
                  autoFocus: true,
                  placeholder: "Enter Bonus",
                  className: "capitalize",
                  readOnly: !editable,
                }}
                labelProps={{
                  children: "Bonus",
                }}
                errors={fields.bonus.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.leave_encashment, { type: "number" }),
                  autoFocus: true,
                  placeholder: "Enter Encashment",
                  className: "capitalize",
                  readOnly: !editable,
                }}
                labelProps={{
                  children: "Leave Encashment",
                }}
                errors={fields.leave_encashment.errors}
              />
              <Field
                inputProps={{
                  ...getInputProps(fields.deduction, { type: "number" }),
                  autoFocus: true,
                  placeholder: "Enter Deduction",
                  className: "capitalize",
                  readOnly: !editable,
                }}
                labelProps={{
                  children: "Deduction",
                }}
                errors={fields.deduction.errors}
              />
            </Form>
          </FormProvider>
        </div>
        <SheetFooter className="mt-auto flex-shrink-0">
          <SheetClose asChild>
            <FormButtons
              form={form}
              isSingle={true}
              className={cn(!editable && "hidden")}
            />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
