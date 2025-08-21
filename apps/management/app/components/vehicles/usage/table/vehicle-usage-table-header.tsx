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

// make sure the order is same as header order
export const VehicleUsageColumnIdArray = [
  "vehicle_number",
  "site_name",
  "month",
  "year",
  "kilometers",
  "fuel_in_liters",
  "fuel_amount",
  "toll_amount",
  "maintainance_amount",
];

export function VehicleUsageTableHeader({ table, className, loading }: Props) {
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

  const columnName = (id: string) =>
    loading ||
    table?.getAllLeafColumns()?.find((col: { id: string }) => {
      return col.id === id;
    })?.columnDef?.header;

  return (
    <TableHeader className={className}>
      <TableRow className="flex h-[45px] bg-card">
        <TableHead className="hidden md:table-cell px-3 md:px-4 py-2 sticky left-0 min-w-12 max-w-12 bg-card z-10 mt-2">
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
        {VehicleUsageColumnIdArray?.map((id) => {
          return (
            isVisible(id) && (
              <TableHead
                key={id}
                className={cn(
                  "px-4 py-2 min-w-32 max-w-32",
                  id === "vehicle_number" &&
                    "sticky left-12 bg-card z-10 min-w-36 max-w-36",
                  id === "maintainance_amount" &&
                    "min-w-40 max-w-40"
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
        <TableHead className="sticky right-0 min-w-20 max-w-20 bg-card z-10" />
      </TableRow>
    </TableHeader>
  );
}
