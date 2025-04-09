import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@canny_ecosystem/ui/sheet";
import { TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useNavigate } from "@remix-run/react";
import { flexRender } from "@tanstack/react-table";

export function ExitPaymentsSheet({
  row,
  rowData,
}: {
  row: any;
  rowData: any;
}) {
  const navigate = useNavigate();

  const netPay =
    rowData.bonus +
    rowData.leave_encashment +
    rowData.gratuity -
    rowData.deduction;
  return (
    <Sheet>
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className="relative cursor-pointer select-text"
      >
        {row.getVisibleCells().map((cell: any) => {
          if (cell.column.id === "select" || cell.column.id === "actions") {
            console.log(cell.column.id);

            return (
              <TableCell
                key={cell.id}
                className={cn(
                  "px-3 md:px-4 py-4 hidden md:table-cell",
                  cell.column.id === "select" &&
                    "sticky left-0 min-w-12 max-w-12 bg-card z-10",

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
                className={cn(
                  "px-3 md:px-4 py-4 hidden md:table-cell",
                  (cell.column.id === "last_working_day" ||
                    cell.column.id === "final_working_day" ||
                    cell.column.id === "organization_payable_days" ||
                    cell.column.id === "employee_payable_days" ||
                    cell.column.id === "reason" ||
                    cell.column.id === "note") &&
                    "hidden md:table-cell",
                  cell.column.id === "employee_code" &&
                    "sticky left-12 bg-card z-10",
                  cell.column.id === "employee_name" &&
                    "sticky left-48 bg-card z-10"
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            </SheetTrigger>
          );
        })}
      </TableRow>
      <SheetContent className="w-[600px]">
        <SheetHeader className="m-5">
          <SheetTitle
            className="flex justify-between cursor-pointer"
            onClick={() => {
              navigate(`/employees/${rowData.employee_id}/payments`);
            }}
          >
            <div>
              <h1 className="text-primary text-3xl">
                {rowData.employees
                  ? `${rowData.employees.first_name} ${
                      rowData.employees.middle_name ?? ""
                    } ${rowData.employees.last_name}`
                  : "--"}
              </h1>
            </div>

            <div className="flex flex-col items-end justify-around">
              <h2 className="text-xl text-muted-foreground">Net Pay</h2>
              <p className="font-bold">{netPay}</p>
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
              Leave Encashment
            </h3>
            <h3 className="my-3 text-muted-foreground font-semibold">
              Gratuity
            </h3>
          </div>
          <div className="text-end font-semibold">
            <p className="my-3">Rs {rowData.bonus ?? "--"}</p>
            <p className="my-3">Rs {rowData.leave_encashment ?? "--"}</p>
            <p className="my-3">Rs {rowData.gratuity ?? "--"}</p>
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
              Deduction
            </h3>
          </div>
          <div className="text-end font-semibold">
            <p className="my-3">Rs {rowData.deduction ?? "--"}</p>
          </div>
        </div>
        <hr />
        <div className=" flex justify-between mx-5">
          <h3 className="my-3 text-muted-foreground font-semibold">Net Pay</h3>
          <p className="my-3 font-bold">Rs {netPay}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
