import {
  Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@canny_ecosystem/ui/sheet";
import { TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { flexRender } from "@tanstack/react-table";
import { useState } from "react";
import { Field } from "@canny_ecosystem/ui/forms";
import { Form } from "@remix-run/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {type  PayrollEmployeeData, PayrollSchema } from "@canny_ecosystem/utils";
import { FormProvider, getFormProps, getInputProps, useForm } from "@conform-to/react";
import { FormButtons } from "../form/form-buttons";

export function PayrollSheet({ row, rowData, editable }: { row:any, rowData:PayrollEmployeeData, editable: boolean }) {
  const [_resetKey, setResetKey] = useState(Date.now());
  const initialValues = {
    gross_pay: rowData.gross_pay,
    reimbursements: rowData.reimbursements
  }

  const [form, fields] = useForm({
    id: rowData.employee_id,
    constraint: getZodConstraint(PayrollSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PayrollSchema });
    },
    shouldValidate: "onInput",
    shouldRevalidate: "onInput",
    defaultValue: {
      ...initialValues,
      site_id: rowData.site_id,
      employee_id: rowData.employee_id
    },
  });

  const grossPay = Number(fields.gross_pay.value ?? 0);
  const reimbursements = Number(fields.reimbursements.value ?? 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <TableRow key={row.id} className="relative cursor-pointer select-text">
          {
            row.getVisibleCells().map((cell:any) => (
              <TableCell
                key={cell.id}
                className={cn(
                  "px-3 md:px-4 py-2 hidden md:table-cell",
                  cell.column.id === "name" &&
                  "sticky left-0 min-w-12 max-w-12 bg-card z-10"
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))
          }
        </TableRow>
      </SheetTrigger>
      <SheetContent className="w-[800px]">
        <SheetHeader className="m-5">
          <SheetTitle className="flex justify-between">
            <div>
              <h1 className="text-primary text-3xl">{rowData.name}</h1>
              <h4 className="my-1 text-muted-foreground text-sm">
                Employee code : {rowData.employee_code ?? "--"}
              </h4>
            </div>

            <div className="flex flex-col items-end justify-around">
              <h2 className="text-xl text-muted-foreground">Net Pay</h2>
              {
                editable
                  ?
                  <p className="font-bold">Rs {grossPay - reimbursements}</p>
                  :
                  <p className="font-bold">Rs {initialValues.gross_pay - initialValues.reimbursements}</p>
              }
            </div>
          </SheetTitle>
        </SheetHeader>
        <FormProvider context={form.context}>
          <Form
            method="POST"
            {...getFormProps(form)}
            className="flex flex-col"
            action={"/payroll/run-payroll/update-payroll-entry"}
          >
            <input {...getInputProps(fields.site_id, { type: "hidden" })} />
            <input {...getInputProps(fields.employee_id, { type: "hidden" })} />
            <div className="mx-5 flex justify-between">
              <h3 className="my-3 text-muted-foreground font-semibold">Paid Days</h3>
              <p className="my-3 font-bold">{rowData.present_days ?? "--"}</p>
            </div>
            <hr />
            <div className="mx-5 flex justify-between">
              <h3 className="my-3 text-green font-semibold">(+) EARNINGS</h3>
              <p className="my-3 font-bold">Amount</p>
            </div>
            <hr />
            <div className="flex justify-between mx-5">
              <div>
                <h3 className="my-3 text-muted-foreground font-semibold">Gross Pay (in Rs)</h3>
              </div>
              <div className="text-end font-semibold">
                {
                  editable
                    ?
                    <Field
                      inputProps={{
                        ...getInputProps(fields.gross_pay, { type: "number" }),
                        className: "capitalize",
                        placeholder: `Enter ${fields.gross_pay.name}`,
                      }}
                      errors={fields.gross_pay.errors}
                    />
                    :
                    <p className="mt-3">{initialValues.gross_pay}</p>
                }
              </div>
            </div>
            <hr />
            <div className="mx-5 flex justify-between">
              <h3 className="my-3 text-destructive font-semibold">(-) DEDUCTION</h3>
              <p className="my-3 font-bold">Amount</p>
            </div>
            <hr />
            <div className="flex justify-between mx-5">
              <div>
                <h3 className="my-3 text-muted-foreground font-semibold">Reimbursements (in Rs)</h3>
              </div>
              <div className="text-end font-semibold">
                {
                  editable
                    ?
                    <Field
                      inputProps={{
                        ...getInputProps(fields.reimbursements, { type: "number" }),
                        className: "capitalize",
                        placeholder: `Enter ${fields.reimbursements.name}`,
                      }}
                      errors={fields.reimbursements.errors}
                    />
                    :
                    <p className="mt-3">{initialValues.reimbursements}</p>
                }
              </div>
            </div>
            <hr />
            <div className="flex justify-between mx-5">
              <h3 className="my-3 text-muted-foreground font-semibold">Net Pay</h3>
              {
                editable
                  ?
                  <p className="font-bold">Rs {grossPay - reimbursements}</p>
                  :
                  <p className="font-bold mt-3">Rs {initialValues.gross_pay - initialValues.reimbursements}</p>
              }
            </div>
          </Form>
        </FormProvider>
        <SheetFooter className="my-20">
          <SheetClose asChild>
            {
              editable && <FormButtons
                form={form}
                setResetKey={setResetKey}
                isSingle={true}
              />
            }
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
