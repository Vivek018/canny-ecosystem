import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState } from "react";

interface Props {
  table?: any;
  loading?: boolean;
  className?: string;
}

// make sure the order is same as header order
export const salaryEntryColumnIdArray = [
  "employee_code",
  "name",
  "amount",
  "payment_status",
];

export function SalaryTableHeader({ table, loading, className }: Props) {
  const [sortingOrder, setSortingOrder] = useState("");
  const [sortingId, setSortingId] = useState("");

  const sort = (id: string) => {
    const column = table
      ?.getAllLeafColumns()
      ?.find((col: any) => col?.columnDef.accessorKey === id);
    column?.toggleSorting();

    if (sortingOrder === "") {
      setSortingOrder("desc");
      setSortingId(id);
    } else if (sortingOrder === "desc") {
      setSortingOrder("asc");
      setSortingId(id);
    } else {
      setSortingOrder("");
      setSortingId("");
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
      <TableRow className="h-[45px] hover:bg-transparent">
        {salaryEntryColumnIdArray.map((id) => (
          <TableHead
            key={id}
            className={cn(
              "px-4 py-2",
              id === "name" && "sticky left-0 bg-card z-10",
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
                name="chevron-down"
                className={cn(
                  "hidden",
                  sortingId === id && sortingOrder === "desc" && "flex",
                )}
              />
              <Icon
                name="chevron-up"
                className={cn(
                  "hidden",
                  sortingId === id && sortingOrder === "asc" && "flex",
                )}
              />
            </Button>
          </TableHead>
        ))}

        <TableHead className="sticky right-0 min-w-20 max-w-20 bg-card z-10" />
      </TableRow>
    </TableHeader>
  );
}
