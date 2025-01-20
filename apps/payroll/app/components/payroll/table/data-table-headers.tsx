import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";

interface Props {
  table?: any;
  className?: string;
  loading?: boolean;
  dynamicHeaders: string[];
  allColumns: ColumnDef<any, any>[];
}

export function PayrollTableHeader({ table, className, loading, dynamicHeaders, allColumns }: Props) {
  const columnName = (id: string) => {
    if (loading) return id;
    const column = allColumns.find((col: any) => col.accessorKey === id);
    return column?.header || id;
  };

  // Combine static and dynamic headers
  const payrollFieldsColumnIdArray = useMemo(() => {
    const staticHeaders = [
      "name",
      "employee_code",
      "present_days",
      "designation",
      "gross_pay",
      "deductions",
      "net_pay",
    ];
    return [...staticHeaders, ...dynamicHeaders];
  }, [dynamicHeaders]);

  const [sortingOrder, setSortingOrder] = useState("");
  const [sortingId, setSortingId] = useState("");

  const sort = (id: string) => {
    const column = table?.getAllLeafColumns()?.find((col: any) => col.accessorKey === id);
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

  return (
    <TableHeader className={className}>
      <TableRow className="h-[45px] hover:bg-transparent">
        {payrollFieldsColumnIdArray.map((id) => (
          <TableHead
            key={id}
            className={cn(
              "px-4 py-2",
              id === "name" && "sticky left-0 bg-card z-10"
            )}
          >
            <Button
              className="p-0 hover:bg-transparent space-x-2 disabled:opacity-100"
              variant="ghost"
              onClick={() => sort(id)}
            >
              <span className="capitalize">{columnName(id)}</span>
              <Icon
                name="chevron-down"
                className={cn("hidden", sortingId === id && sortingOrder === "desc" && "flex")}
              />
              <Icon
                name="chevron-up"
                className={cn("hidden", sortingId === id && sortingOrder === "asc" && "flex")}
              />
            </Button>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}