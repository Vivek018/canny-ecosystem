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
export const ReimbursementsColumnIdArray = [
  "employee_code",
  "employee_name",
  "project_name",
  "site_name",
  "submitted_date",
  "status",
  "amount",
  "type",
  "email",
];

export function ReimbursementsTableHeader({
  table,
  className,
  loading,
}: Props) {
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
      <TableRow className='h-[45px] hover:bg-transparent'>

        {ReimbursementsColumnIdArray?.map((id) => {
          return (
            isVisible(id) && (
              <TableHead key={id} className={cn("px-4 py-2")}>
                <Button
                  className='p-0 hover:bg-transparent space-x-2 disabled:opacity-100'
                  variant='ghost'
                  disabled={!isEnableSorting(id)}
                  onClick={(e) => {
                    e.preventDefault();
                    createSortQuery(id);
                  }}
                >
                  <span className='capitalize'>{columnName(id)}</span>
                  <Icon
                    name='chevron-up'
                    className={cn(
                      "hidden",
                      id === column && value === "desc" && "flex"
                    )}
                  />
                  <Icon
                    name='chevron-down'
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
