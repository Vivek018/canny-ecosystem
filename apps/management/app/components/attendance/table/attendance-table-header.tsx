import type { DayType } from "@/routes/_protected+/time-tracking+/attendance+/_index";
import { Button } from "@canny_ecosystem/ui/button";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { Icon } from "@canny_ecosystem/ui/icon";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { formatDate } from "@canny_ecosystem/utils";
import { useSearchParams } from "@remix-run/react";

type Props = {
  table?: any;
  className?: string;
  loading?: boolean;
  days: DayType[];
};

export function AttendanceTableHeader({
  table,
  className,
  loading,
  days,
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  // make sure the order is same as header order
  const AttendanceColumnIdArray = [
    "employee_code",
    "employee_name",
    "project_name",
    "project_site_name",
    ...days.map(
      (day: { fullDate: { toString: () => string | number | Date } }) =>
        formatDate(day.fullDate.toString())
    ),
  ];
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
      <TableRow className="h-[45px] hover:bg-transparent">
        <TableHead className="hidden md:table-cell px-3 md:px-4 py-2 sticky left-0 min-w-12 max-w-12 bg-card z-10">
          <Checkbox
            checked={
              table?.getIsAllPageRowsSelected() ||
              (table?.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => {
              table?.toggleAllPageRowsSelected(!!value);
            }}
          />
        </TableHead>
        {AttendanceColumnIdArray?.map((id) => {
          return (
            isVisible(id!) && (
              <TableHead
                key={id}
                className={cn(
                  "px-4 py-2 min-w-32",
                  id === "employee_code" && "sticky left-12 bg-card z-10",
                  id === "employee_name" && "sticky left-48 bg-card z-10"
                )}
              >
                <Button
                  className="p-0 hover:bg-transparent space-x-2 disabled:opacity-100"
                  variant="ghost"
                  disabled={!isEnableSorting(id!)}
                  onClick={(e) => {
                    e.preventDefault();
                    createSortQuery(id!);
                  }}
                >
                  <span className="capitalize">{columnName(id!)}</span>
                  <Icon
                    name="chevron-up"
                    className={cn(
                      "hidden",
                      id === column && value === "desc" && "flex"
                    )}
                  />
                  <Icon
                    name="chevron-down"
                    className={cn(
                      "hidden",
                      id === column && value === "asc" && "flex"
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
