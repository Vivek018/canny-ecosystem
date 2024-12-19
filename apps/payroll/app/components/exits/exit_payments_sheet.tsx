import type { ExitPaymentsRow } from "@canny_ecosystem/supabase/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@canny_ecosystem/ui/sheet";
import { TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { flexRender } from "@tanstack/react-table";

export function ExitPaymentsSheet({
  row,
  rowData,
}: { row: any; rowData: any }) {
  const paymentSummary = rowData.exit_payments?.reduce(
    (
      acc: Record<string, number>,
      payment: Omit<ExitPaymentsRow, "created_at" | "updated_at"> & {
        payment_fields: { name: string };
      },
    ) => {
      const key = payment.payment_fields.name;
      const value = payment.amount;

      acc.total = 0;
      acc[key] = value;
      acc.total += value;
      return acc;
    },
    {},
  );

  return (
    <Sheet>
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className="relative cursor-default select-text"
      >
        {row.getVisibleCells().map((cell: any) => {
          if (cell.column.id === "select" || cell.column.id === "actions") {
            return (
              <TableCell
                key={cell.id}
                className={cn(
                  "px-3 md:px-4 py-4 hidden md:table-cell",
                    cell.column.id === "select" &&
                    "sticky left-0 min-w-12 max-w-12 bg-card z-10",
                  cell.column.id === "actions" && "sticky right-0 min-w-20 max-w-20 bg-card z-10",
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          }
          return (
            <SheetTrigger asChild key={cell.id}>
              <TableCell
                className={cn(
                  "px-3 md:px-4 py-4 hidden md:table-cell",
                  (
                    cell.column.id === "last_working_day" ||
                    cell.column.id === "final_working_day" ||
                    cell.column.id === "organization_payable_days" ||
                    cell.column.id === "employee_payable_days" ||
                    cell.column.id === "reason" ||
                    cell.column.id === "note") &&
                    "hidden md:table-cell",
                  cell.column.id === "employee_name" &&
                    "sticky left-12 bg-card z-10",
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            </SheetTrigger>
          );
        })}
      </TableRow>
      <SheetContent className="w-[800px]">
        <SheetHeader className="m-5">
          <SheetTitle className="flex  justify-between">
            <div>
              <h1 className="text-primary text-3xl">
                {rowData.employee_name
                  ? `${rowData.employee_name.first_name} ${rowData.employee_name.middle_name ?? ""} ${rowData.employee_name.last_name}`
                  : "--"}
              </h1>
            </div>

            <div className="flex flex-col items-end justify-around">
              <h2 className="text-xl text-muted-foreground">Net Pay</h2>
              <p className="font-bold">{paymentSummary?.total}</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <hr />
        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-green font-semibold">(+) EARNINGS</h3>
          <p className="my-3 font-bold">Amount</p>
        </div>
        <hr />
        <div className="flex justify-between mx-5">
          <div>
            <h3 className="my-3 text-muted-foreground font-semibold">Bonus</h3>

            <h3 className="my-3 text-muted-foreground font-semibold">
              Diwali Bonus
            </h3>

            <h3 className="my-3 text-muted-foreground font-semibold">
              Commission
            </h3>

            <h3 className="my-3 text-muted-foreground font-semibold">
              Joining Bonus
            </h3>

            <h3 className="my-3 text-muted-foreground font-semibold">
              Yearly Bonus
            </h3>

            <h3 className="my-3 text-muted-foreground font-semibold">
              Leave Encashment
            </h3>

            <h3 className="my-3 text-muted-foreground font-semibold">
              Gift Coupon
            </h3>

            <h3 className="my-3 text-muted-foreground font-semibold">
              Gratuity
            </h3>
          </div>
          <div className="text-end font-semibold">
            <p className="my-3">Rs {paymentSummary?.bonus ?? "--"}</p>
            <p className="my-3">Rs {paymentSummary?.diwali_bonus ?? "--"}</p>
            <p className="my-3">Rs {paymentSummary?.commision ?? "--"}</p>
            <p className="my-3">Rs {paymentSummary?.joining_bonus ?? "--"}</p>
            <p className="my-3">Rs {paymentSummary?.yearly_bonus ?? "--"}</p>
            <p className="my-3">
              Rs {paymentSummary?.leave_encashment ?? "--"}
            </p>
            <p className="my-3">Rs {paymentSummary?.gift_coupon ?? "--"}</p>
            <p className="my-3">Rs {paymentSummary?.gratuity ?? "--"}</p>
          </div>
        </div>
        <hr />
        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-destructive font-semibold">(-) DEDUCTION</h3>
          <p className="my-3 font-bold">Amount</p>
        </div>
        <hr />
        <div className=" flex justify-between mx-5">
          <div className="">
            <h3 className="my-3 text-muted-foreground font-semibold">
              Computer Service Charges
            </h3>
            <h3 className="my-3 text-muted-foreground font-semibold">
              Deduction
            </h3>
          </div>
          <div className="text-end font-semibold">
            <p className="my-3">
              Rs {paymentSummary?.computer_service_charges ?? "--"}
            </p>
            <p className="my-3">Rs {paymentSummary?.deduction ?? "--"}</p>
          </div>
        </div>
        <hr />
        <div className=" flex justify-between mx-5">
          <h3 className="my-3 text-muted-foreground font-semibold">Net Pay</h3>
          <p className="my-3 font-bold">Rs {paymentSummary?.total ?? "--"}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
