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
import { Link } from "@remix-run/react";
import { flexRender } from "@tanstack/react-table";

function getName(type: string, data: any, keyPrefix: string): string {
  const entity = data?.[`${keyPrefix}_${type}`];
  switch (type) {
    case "project":
      return entity?.name || "Canny Inc.";
    case "employee":
      return entity ? entity?.employee_code : "Canny Inc.";
    case "site":
      return entity?.name || "Canny Inc.";
    case "company":
      return entity?.name || "Canny Inc.";
    default:
      return "Canny Inc.";
  }
}

function getRedirectUrl(type: string, data: any, keyPrefix: string): string {
  const entity = data?.[`${keyPrefix}_${type}`];
  switch (type) {
    case "employee":
      return `/employees/${entity?.id}/overview`;
    case "site":
      return "/modules/sites";
    case "project":
      return "/modules/projects";
    default:
      return "?";
  }
}

function KeyValueRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-5 flex justify-between ${className}`}>
      <h3 className="my-3 text-muted-foreground font-semibold capitalize">
        {label}
      </h3>
      <p className="my-3 font-bold">{value}</p>
    </div>
  );
}

export function CaseSheet({ row, rowData }: { row: any; rowData: any }) {
  const reportedByName = getName(rowData?.reported_by, rowData, "reported_by");
  const reportedOnName = getName(rowData?.reported_on, rowData, "reported_on");
  const redirectedToReportedOn = getRedirectUrl(
    rowData?.reported_on,
    rowData,
    "reported_on",
  );
  const redirectedToReportedBy = getRedirectUrl(
    rowData?.reported_by,
    rowData,
    "reported_by",
  );

  return (
    <Sheet>
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className="relative cursor-pointer select-text"
      >
        {row.getVisibleCells().map((cell: any) => {
          if (cell.column.id === "select" || cell.column.id === "actions") {
            return (
              <TableCell
                key={cell.id}
                className={cn(
                  "px-3 md:px-4 py-4 table-cell",
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
              <TableCell className={cn("px-4 py-4 table-cell")}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            </SheetTrigger>
          );
        })}
      </TableRow>

      <SheetContent className="w-[600px] h-full overflow-y-auto">
        <SheetHeader className="m-5">
          <SheetTitle className="text-3xl">{rowData?.title ?? "--"}</SheetTitle>
          <SheetDescription className="text-sm text-wrap break-words text-muted-foreground">
            {rowData?.description ?? "--"}
          </SheetDescription>
        </SheetHeader>

        <hr />
        <KeyValueRow
          label="Court Case Reference"
          value={rowData?.court_case_reference ?? "--"}
        />
        <hr />
        <KeyValueRow
          label="Status"
          value={
            <span
              className={cn(
                "capitalize",
                rowData?.status === "open" && "text-emerald-400",
                rowData?.status === "closed" && "text-red-400",
                rowData?.status === "resolved" && "text-green-400",
              )}
            >
              {rowData?.status ?? "--"}
            </span>
          }
        />
        <KeyValueRow
          label="Case Type"
          value={rowData?.case_type ?? "--"}
          className="capitalize"
        />
        <KeyValueRow
          label="Location"
          value={rowData?.location ?? "--"}
          className="capitalize"
        />
        <KeyValueRow
          label="Date"
          value={rowData?.date ? formatDate(rowData?.date!) : "--"}
        />
        <KeyValueRow
          label="Resolution Date"
          value={
            rowData?.resolution_date
              ? formatDate(rowData?.resolution_date)
              : "--"
          }
        />
        <KeyValueRow
          label="Incident Date"
          value={
            rowData?.incident_date ? formatDate(rowData?.incident_date) : "--"
          }
        />

        <hr />
        <KeyValueRow
          label="Reported On"
          value={rowData?.reported_on ?? "--"}
          className="capitalize"
        />
        {rowData?.reported_on !== "other" && (
          <KeyValueRow
            label={`R/O ${rowData?.reported_on ?? ""}`}
            value={
              <Link
                to={redirectedToReportedOn}
                className={cn(
                  "font-bold capitalize cursor-text",
                  rowData?.reported_on !== "company" &&
                    rowData?.reported_on !== "other" &&
                    rowData?.reported_on !== "canny" &&
                    "text-primary/80 group-hover:text-primary cursor-pointer",
                )}
              >
                {reportedOnName}
              </Link>
            }
          />
        )}

        <hr />
        <KeyValueRow
          label="Reported By"
          value={rowData?.reported_by ?? "--"}
          className="capitalize"
        />
        {rowData?.reported_by !== "other" && (
          <KeyValueRow
            label={`R/B ${rowData?.reported_by ?? ""}`}
            value={
              <Link
                to={redirectedToReportedBy}
                className={cn(
                  "font-bold capitalize cursor-text",
                  rowData?.reported_by !== "company" &&
                    rowData?.reported_by !== "other" &&
                    rowData?.reported_by !== "canny" &&
                    "text-primary/80 group-hover:text-primary cursor-pointer",
                )}
              >
                {reportedByName}
              </Link>
            }
          />
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
