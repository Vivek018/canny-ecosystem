import { Button } from "@canny_ecosystem/ui/button";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { Icon } from "@canny_ecosystem/ui/icon";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSearchParams } from "@remix-run/react";

type Props = {
  table?: any;
  className?: string;
  loading?: boolean;
};
export const AttendanceColumnIdArray = [
  "employee_code",
  "first_name",
  "project_name",
  "site_name",
  "month",
  "year",
  "working_days",
  "present_days",
  "absent_days",
  "working_hours",
  "overtime_hours",
  "paid_holidays",
  "paid_leaves",
  "casual_leaves",
];

export function AttendanceTableHeader({ table, className, loading }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const sortParam = searchParams.get("sort");
  const [column, value] = sortParam ? sortParam.split(":") : [];

  const createSortQuery = (name: string) => {
    if (`${name}:asc` === sortParam) {
      searchParams.set("sort", `${name}:desc`);
    } else if (`${name}:desc` === sortParam) {
      searchParams.delete("sort");
    } else {
      searchParams.set("sort", `${name}:asc`);
    }
    setSearchParams(searchParams);
  };
  const isVisible = (id: string) =>
    loading ||
    table
      ?.getAllLeafColumns()
      ?.find((col: any) => {
        return col.id === id;
      })
      ?.getIsVisible();

  const isEnableSorting = (id: string) =>
    (
      loading ||
      table?.getAllLeafColumns()?.find((col: { id: string }) => {
        return col.id === id;
      })
    )?.getCanSort();

  const columnName = (id: string) => {
    const foundColumn = table
      ?.getAllLeafColumns()
      ?.find((col: { id: string }) => col.id === id);
    return loading || foundColumn?.columnDef?.header || id;
  };

  return (
    <TableHeader className={className}>
      <TableRow className="h-[45px] bg-card">
        <TableHead className="table-cell px-4 py-2 sticky left-0 min-w-12 max-w-12 bg-card z-10">
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

        {AttendanceColumnIdArray?.map((id) => {
          return (
            isVisible(id) && (
              <TableHead
                key={id}
                className={cn(
                  "px-4 py-2 min-w-36 max-w-36",

                  id === "employee_code" && "table-cell",
                  id === "first_name" && "min-w-48 max-w-48 table-cell",
                )}
              >
                <Button
                  className="p-0 hover:bg-transparent space-x-2 disabled:opacity-100"
                  variant="ghost"
                  disabled={!isEnableSorting(id)}
                  onClick={(e) => {
                    e.preventDefault();
                    createSortQuery(id);
                  }}
                >
                  <span className="capitalize">{columnName(id)}</span>

                  <Icon
                    name="chevron-up"
                    className={cn(
                      "hidden",
                      id === column && value === "desc" && "flex",
                    )}
                  />
                  <Icon
                    name="chevron-down"
                    className={cn(
                      "hidden",
                      id === column && value === "asc" && "flex",
                    )}
                  />
                </Button>
              </TableHead>
            )
          );
        })}
      </TableRow>
    </TableHeader>
  );
}
