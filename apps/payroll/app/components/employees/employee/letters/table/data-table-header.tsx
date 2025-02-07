import { Button } from "@canny_ecosystem/ui/button";
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
export const emplyoeeLettersColumnIdArray = ["letter_type", "date", "subject"];

export function DataTableHeader({ table, className, loading }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get("sort");
  const [column, value] = sortParam ? sortParam.split(":") : [];

  const columnName = (id: string) =>
    loading ||
    table?.getAllLeafColumns()?.find((col: any) => {
      return col.id === id;
    })?.columnDef?.header;

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

  const isEnableSorting = (id: string) =>
    (
      loading ||
      table?.getAllLeafColumns()?.find((col: any) => {
        return col.id === id;
      })
    )?.getCanSort();

  return (
    <TableHeader className={className}>
      <TableRow className="h-[45px] hover:bg-transparent">
        {emplyoeeLettersColumnIdArray?.map((id) => {
          return (
            <TableHead key={id} className={cn("px-4 py-2")}>
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
          );
        })}
        <TableHead className="sticky right-0 min-w-20 max-w-20 bg-card z-10" />
      </TableRow>
    </TableHeader>
  );
}
