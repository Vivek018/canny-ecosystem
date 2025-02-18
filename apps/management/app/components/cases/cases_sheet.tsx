import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@canny_ecosystem/ui/sheet";
import { TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDate } from "@canny_ecosystem/utils";
import { flexRender } from "@tanstack/react-table";

export function CasesSheet({ row, rowData }: { row: any; rowData: any }) {
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
                  cell.column.id === "actions" &&
                    "sticky right-0 min-w-20 max-w-20 bg-card z-10",
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
                  cell.column.id === "title" && "sticky left-12 bg-card z-10",
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
          <SheetTitle className="grid grid-cols-2">
            <div className="inline-block w-[40vw] h-full text-wrap">
              <h1 className="text-primary text-3xl">{rowData.title ?? "--"}</h1>
              <p className="text-muted-foreground text-lg line-clamp-4">
                {rowData.description ?? ""}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <hr />
        <div className="mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">
            Court Case Reference
          </h3>
          <p className="my-3 font-bold capitalize">
            {rowData.court_case_reference ?? "--"}
          </p>
        </div>
        <hr />
        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">Status</h3>
          <p
            className={cn(
              "my-3 font-bold capitalize",
              rowData.status === "open" && "text-emerald-400",
              rowData.status === "closed" && "text-red-400",
              rowData.status === "resolved" && "text-green-400",
              rowData.status === "in-progress" && "text-amber-400",
            )}
          >
            {rowData.status ?? "--"}
          </p>
        </div>

        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">
            Case Type
          </h3>
          <p className="my-3 font-bold capitalize">
            {rowData.case_type ?? "--"}
          </p>
        </div>

        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">Location</h3>
          <p className="my-3 font-bold capitalize">
            {rowData.location === "other"
              ? rowData.location
              : rowData.location_type ?? "--" ?? "--"}
          </p>
        </div>

        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">Date</h3>
          <p className="my-3 font-bold">{formatDate(rowData.date) ?? "--"}</p>
        </div>

        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">
            Resolution Date
          </h3>
          <p className="my-3 font-bold">
            {formatDate(rowData.resolution_date) ?? "--"}
          </p>
        </div>

        <hr className="my-3" />
        <div className="flex justify-between mx-5">
          <div>
            <h3 className="my-3 text-muted-foreground font-semibold">
              Amount Given (-)
            </h3>
            <h3 className="my-3 text-muted-foreground font-semibold">
              Amount Received (+)
            </h3>
          </div>
          <div className="text-end font-semibold">
            <p className="my-3">Rs {rowData.amount_given ?? "--"}</p>
            <p className="my-3">Rs {rowData.amount_received ?? "--"}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
