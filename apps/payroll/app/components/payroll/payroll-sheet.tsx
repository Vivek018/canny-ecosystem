import { Button } from "@canny_ecosystem/ui/button";
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

export function PayrollSheet({ row, rowData }: { row: any; rowData: any }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <TableRow key={row.id} className="relative  cursor-pointer select-text">
          {row.getVisibleCells().map((cell: any) => (
            <TableCell
              key={cell.id}
              className={cn(
                " px-3 md:px-4 py-2 hidden md:table-cell",
                cell.column.id === "name" &&
                  "sticky left-0 min-w-12 max-w-12 bg-card z-10",
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      </SheetTrigger>
      <SheetContent className="w-[800px] overflow-y-auto">
        <SheetHeader className="m-5">
          <SheetTitle className="flex  justify-between">
            <div>
              <h1 className="text-primary text-3xl">{rowData.name}</h1>
              <h4 className="my-1 text-muted-foreground text-sm">
                Mobile Number : {rowData.mobile_number ?? "--"}
              </h4>
              <h4 className="my-1 text-muted-foreground text-sm">
                Email : {rowData.email ?? "--"}
              </h4>
            </div>

            <div className="flex flex-col items-end justify-around">
              <h2 className="text-xl text-muted-foreground">Net Pay</h2>
              <p className="font-bold">{rowData.net_pay}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">
            Paid Days
          </h3>
          <p className="my-3 font-bold">{rowData.paid_days ?? "--"}</p>
        </div>
        <hr />
        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-green font-semibold">(+) EARNINGS</h3>
          <p className="my-3 font-bold">Amount</p>
        </div>
        <hr />
        <div className="flex justify-between mx-5">
          <div>
            <h3 className="my-3 text-muted-foreground font-semibold">
              Gross Pay
            </h3>

            <h3 className="my-3 text-muted-foreground font-semibold">Bonus</h3>

            <h3 className="my-3 text-muted-foreground font-semibold">
              Reimbursements
            </h3>
          </div>
          <div className="text-end font-semibold">
            <p className="my-3">Rs {rowData.gross_pay ?? "--"}</p>
            <p className="my-3">Rs {rowData.bonus ?? "--"}</p>
            <p className="my-3">Rs {rowData.reimbursements ?? "--"}</p>
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
            <h3 className="my-3 text-muted-foreground font-semibold">Taxes</h3>
            <h3 className="my-3 text-muted-foreground font-semibold">
              Discounts
            </h3>
          </div>
          <div className="text-end font-semibold">
            <p className="my-3">Rs {rowData.taxes ?? "--"}</p>
            <p className="my-3">Rs {rowData.discount ?? "--"}</p>
          </div>
        </div>
        <hr />
        <div className=" flex justify-between mx-5">
          <h3 className="my-3 text-muted-foreground font-semibold">Net Pay</h3>
          <p className="my-3 font-bold">Rs {rowData.net_pay ?? "--"}</p>
        </div>

        <SheetFooter className="my-20">
          <SheetClose asChild>
            <Button className="" type="submit" onClick={() => {}}>
              Save changes
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
