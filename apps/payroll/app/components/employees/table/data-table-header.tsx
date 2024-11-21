import { Button } from "@canny_ecosystem/ui/button";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { Icon } from "@canny_ecosystem/ui/icon";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useSearchParams } from "@remix-run/react";

type Props = {
  table?: any;
  loading?: boolean;
  className?: string;
};

// make sure the order is same as header order
export const employeeColumnIdArray = [
  "employee_code",
  "full_name",
  "primary_mobile_number",
  "date_of_birth",
  "education",
  "gender",
  "is_active",
  "employee_project_assignment_project_site_project_name",
  "employee_project_assignment_project_site_name",
  "employee_project_assignment_assignment_type",
  "employee_project_assignment_position",
  "employee_project_assignment_skill_level",
  "employee_project_assignment_start_date",
  "employee_project_assignment_end_date",
];

export function DataTableHeader({ table, loading, className }: Props) {
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
      <TableRow className='h-[45px] hover:bg-transparent'>
        <TableHead className='hidden md:table-cell px-3 md:px-4 py-2 sticky left-0 min-w-12 max-w-12 bg-card z-10'>
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

        {employeeColumnIdArray?.map((id) => {
          return (
            isVisible(id) && (
              <TableHead
                key={id}
                className={cn(
                  "px-4 py-2",
                  id === "employee_code" && "sticky left-12 bg-card z-10",
                  id === "full_name" && "sticky w-full left-48 bg-card z-10"
                )}
              >
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
        <TableHead className='sticky right-0 min-w-20 max-w-20 bg-card z-10' />
      </TableRow>
    </TableHeader>
  );
}
