import type { CasesDataType } from "@canny_ecosystem/supabase/queries";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@canny_ecosystem/ui/sheet";
import { TableCell, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDate } from "@canny_ecosystem/utils";
import { flexRender } from "@tanstack/react-table";

export function CaseSheet({
  row,
  rowData,
}: { row: any; rowData: CasesDataType }) {
  const reportedByName: string =
    rowData?.reported_by === "project"
      ? rowData?.reported_on_project.name
      : rowData?.reported_by === "employee"
        ? `${rowData?.reported_by_employee.first_name} ${rowData?.reported_by_employee.last_name}`
        : rowData?.reported_by === "site"
          ? rowData?.reported_on_site.name
          : rowData?.reported_by === "company"
            ? rowData?.reported_on_company.name
            : "Canny Inc.";

  const reportedOnName: string =
    rowData?.reported_on === "project"
      ? rowData?.reported_on_project.name
      : rowData?.reported_on === "employee"
        ? `${rowData?.reported_on_employee.first_name} ${rowData?.reported_on_employee.last_name}`
        : rowData?.reported_on === "site"
          ? rowData?.reported_on_site.name
          : rowData?.reported_on === "company"
            ? rowData?.reported_on_company.name
            : "Canny Inc.";
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
      <SheetContent className="w-[600px]">
        <SheetHeader className="m-5">
          <SheetTitle className="text-primary text-3xl">
            {rowData?.title ?? "--"}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm line-clamp-4">
            {rowData?.description ?? ""}
          </SheetDescription>
        </SheetHeader>
        <hr />
        <div className="mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">
            Court Case Reference
          </h3>
          <p className="my-3 font-bold capitalize">
            {rowData?.court_case_reference ?? "--"}
          </p>
        </div>
        <hr />
        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">Status</h3>
          <p
            className={cn(
              "my-3 font-bold capitalize",
              rowData?.status === "open" && "text-emerald-400",
              rowData?.status === "closed" && "text-red-400",
              rowData?.status === "resolved" && "text-green-400",
            )}
          >
            {rowData?.status ?? "--"}
          </p>
        </div>

        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">
            Case Type
          </h3>
          <p className="my-3 font-bold capitalize">
            {rowData?.case_type ?? "--"}
          </p>
        </div>

        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">Location</h3>
          <p className="my-3 font-bold capitalize">
            {rowData?.location === "other"
              ? rowData?.location
              : rowData?.location_type ?? "--" ?? "--"}
          </p>
        </div>

        <div className="mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">Date</h3>
          <p className="my-3 font-bold">{formatDate(rowData?.date) ?? "--"}</p>
        </div>

        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">
            Resolution Date
          </h3>
          <p className="my-3 font-bold">
            {rowData?.resolution_date
              ? formatDate(rowData?.resolution_date ?? "")
              : "--"}
          </p>
        </div>

        {
          <div className=" mx-5 flex justify-between">
            <h3 className="my-3 text-muted-foreground font-semibold">
              Incident Date
            </h3>
            <p className="my-3 font-bold">
              {rowData?.incident_date
                ? formatDate(rowData?.incident_date)
                : "--"}
            </p>
          </div>
        }

        <hr />
        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">
            Reported On
          </h3>
          <p className="my-3 font-bold capitalize">
            {rowData?.reported_on ?? "--"}
          </p>
        </div>
        {rowData?.reported_on !== "other" && (
          <div className=" mx-5 flex justify-between">
            <h3 className="my-3 text-muted-foreground font-semibold capitalize">
              R/O {rowData?.reported_on ?? ""} Name
            </h3>
            <p className="my-3 font-bold capitalize">{reportedOnName}</p>
          </div>
        )}
        <hr />
        <div className=" mx-5 flex justify-between">
          <h3 className="my-3 text-muted-foreground font-semibold">
            Reported By
          </h3>
          <p className="my-3 font-bold capitalize">
            {rowData?.reported_by ?? "--"}
          </p>
        </div>

        {rowData?.reported_by !== "other" && (
          <div className=" mx-5 flex justify-between">
            <h3 className="my-3 text-muted-foreground font-semibold capitalize">
              R/B {rowData?.reported_by ?? ""} Name
            </h3>
            <p className="my-3 font-bold capitalize">{reportedByName}</p>
          </div>
        )}

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
            <p className="my-3">Rs {rowData?.amount_given ?? "--"}</p>
            <p className="my-3">Rs {rowData?.amount_received ?? "--"}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
