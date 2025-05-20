import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";

type Props = {
  table?: any;
  className?: string;
  loading?: boolean;
  sort?: string;
  handleSort?: any;
};

// make sure the order is same as header order
export const invoiceColumnIdArray = ["invoice_number", "subject", "date"];

export function DataTableHeader({ table, className, loading }: Props) {
  const columnName = (id: string) =>
    loading ||
    table?.getAllLeafColumns()?.find((col: any) => {
      return col.id === id;
    })?.columnDef?.header;

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
        {invoiceColumnIdArray?.map((id) => {
          return (
            <TableHead
              key={id}
              className={cn(
                "px-4 py-2",
                id === "invoice_number" && "sticky left-0 bg-card z-10"
              )}
            >
              <Button
                className="p-0 hover:bg-transparent space-x-2 disabled:opacity-100"
                variant="ghost"
                disabled={!isEnableSorting(id)}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <span className="capitalize">{columnName(id)}</span>
                <Icon name="chevron-up" className={cn("hidden")} />
                <Icon name="chevron-down" className={cn("hidden")} />
              </Button>
            </TableHead>
          );
        })}
        <TableHead className="sticky right-0 min-w-20 max-w-20 bg-card z-10" />
      </TableRow>
    </TableHeader>
  );
}
