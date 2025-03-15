import { useEffect, useState } from "react";
import { PayrollSchema } from "@canny_ecosystem/utils";
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { Field, type ListOfErrors } from "@canny_ecosystem/ui/forms";
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
import { FormButtons } from "../../form/form-buttons";
import type { PayrollEntriesWithEmployee } from "@canny_ecosystem/supabase/queries";

export function ReimbursementPayrollSheet({
  row,
  rowData,
  editable,
}: { row: any; rowData: PayrollEntriesWithEmployee; editable: boolean }) {
  const name = `${row.original?.employees?.first_name} ${row.original?.employees?.middle_name ?? ""} ${
    row.original?.employees?.last_name ?? ""
  }`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <TableRow key={row.id} className="relative cursor-pointer select-text">
          {row.getVisibleCells()?.map((cell: any) => (
            <TableCell
              key={cell.id || Date.now()}
              className={cn(
                "px-3 md:px-4 py-2 hidden md:table-cell",
                cell.column.id === "name" &&
                  "sticky left-0 min-w-12 max-w-12 bg-card z-10",
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      </SheetTrigger>
      <SheetContent className="w-[600px]">
        <SheetHeader className="m-5 flex-shrink-0">
          <SheetTitle className="flex justify-between">
            <div>
              <h1 className="text-primary text-3xl">{name}</h1>
              <h4 className="my-1 text-muted-foreground text-sm">
                Employee Code: {rowData?.employees?.employee_code ?? "--"}
              </h4>
            </div>

            <div className="flex flex-col items-end justify-around">
              <h2 className="text-xl text-muted-foreground">Net Pay</h2>
              <p className="font-bold">Rs {rowData.amount}</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5">
          {/* <FormProvider context={form.context}>
            <Form
              method="POST"
              {...getFormProps(form)}
              className="flex flex-col"
              action="/payroll/run-payroll/update-payroll-entry"
            > */}
          {/* <input
                {...getInputProps(fields.employee_id, { type: "hidden" })}
              />
              <input {...getInputProps(fields.payrollId, { type: "hidden" })} />
              */}

          <div className="flex justify-between">
            <h3 className="my-3 text-muted-foreground font-semibold">
              Net Pay
            </h3>
            <p className="font-bold">Rs {rowData?.amount}</p>
          </div>
          {/* </Form>
          </FormProvider> */}
        </div>
        <SheetFooter className="mt-6 flex-shrink-0">
          <SheetClose asChild>
            {/* {editable && (
              <FormButtons
                form={form}
                setResetKey={setResetKey}
                isSingle={true}
              />
            )} */}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
