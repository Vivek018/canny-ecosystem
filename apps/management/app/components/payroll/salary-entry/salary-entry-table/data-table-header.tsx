import { Button } from "@canny_ecosystem/ui/button";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { Icon } from "@canny_ecosystem/ui/icon";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState } from "react";

interface Props {
  table?: any;
  loading?: boolean;
  className?: string;
  uniqueFields: string[];
}

export function SalaryTableHeader({
  table,
  loading,
  className,
  uniqueFields,
}: Props) {
  const salaryEntryColumnIdArray = [
    "sr_no",
    "employee_code",
    "name",
    "site",
    "department",
    "present_days",
    "overtime_hours",
    "period",
    ...uniqueFields.map((field) => field),
    "net_amount",
  ];

  const [sortingOrder, setSortingOrder] = useState("");
  const [sortingId, setSortingId] = useState("");

  const sort = (id: string) => {
    const column = table
      ?.getAllLeafColumns()
      ?.find((col: any) => col?.columnDef.accessorKey === id);

    if (!column) return;

    if (sortingId !== id) {
      table.resetSorting();
      column.toggleSorting(false);
      setSortingOrder("asc");
      setSortingId(id);
    } else {
      if (sortingOrder === "") {
        column.toggleSorting(false);
        setSortingOrder("asc");
      } else if (sortingOrder === "asc") {
        column.toggleSorting(true);
        setSortingOrder("desc");
      } else {
        table.resetSorting();
        setSortingOrder("");
        setSortingId("");
      }
    }
  };

  const isEnableSorting = (id: string) =>
    (
      loading ||
      table?.getAllLeafColumns()?.find((col: any) => {
        return col.id === id;
      })
    )?.getCanSort();

  const columnName = (id: string) =>
    loading ||
    table?.getAllLeafColumns()?.find((col: any) => {
      return col.id === id;
    })?.columnDef?.header;

  return (
    <TableHeader className={className}>
      <TableRow className="h-[45px] bg-card">
        <TableHead className="hidden md:table-cell px-3 md:px-4 py-2 sticky left-0 min-w-12 max-w-12 bg-card z-10">
          <Checkbox
            checked={
              table?.getIsAllPageRowsSelected() ||
              (table?.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        </TableHead>

        {salaryEntryColumnIdArray?.map((id) => {
          return (
            <TableHead
              key={id}
              className={cn(
                "px-4 py-2 min-w-24 max-w-24",
                id === "sr_no" &&
                  "sticky left-12 bg-card min-w-20 max-w-20 z-10",
                id === "employee_code" &&
                  "sticky left-32 bg-card z-10 min-w-36 max-w-36",
                id === "name" && "min-w-52 max-w-52",
                id.length > 7 &&
                  id !== "employee_code" &&
                  id !== "department" &&
                  "min-w-40 max-w-40"
              )}
            >
              <Button
                className="p-0 hover:bg-transparent space-x-2 disabled:opacity-100"
                variant="ghost"
                disabled={!isEnableSorting(id)}
                onClick={() => sort(id)}
              >
                <span className="capitalize">{columnName(id)}</span>
                <Icon
                  name="chevron-up"
                  className={cn(
                    "hidden",
                    sortingId === id && sortingOrder === "desc" && "flex"
                  )}
                />
                <Icon
                  name="chevron-down"
                  className={cn(
                    "hidden",
                    sortingId === id && sortingOrder === "asc" && "flex"
                  )}
                />
              </Button>
            </TableHead>
          );
        })}
        <TableHead className="sticky right-0 min-w-20 max-w-20 bg-card z-10" />
      </TableRow>
    </TableHeader>
  );
}
