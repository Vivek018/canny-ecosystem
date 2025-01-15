import { Button } from "@canny_ecosystem/ui/button";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";

type Props = {
  table?: any;
  className?: string;
  loading?: boolean;
};

// make sure the order is same as header order
export const ImportEmployeeDataArray = [
  "employee_code",
  "account_holder_name",
  "account_number",
  "ifsc_code",
  "account_type",
  "bank_name",
  "branch_name",
];

export function ImportedDataTableHeader({ table, className, loading }: Props) {
  const columnName = (id: string) =>
    loading ||
    table?.getAllLeafColumns()?.find((col: { id: string }) => {
      return col.id === id;
    })?.columnDef?.header;

  return (
    <TableHeader className={className}>
      <TableRow className="h-[45px] hover:bg-transparent">
        {ImportEmployeeDataArray?.map((id) => {
          return (
            <TableHead key={id} className={cn("px-4 py-2")}>
              <Button
                className="p-0 hover:bg-transparent space-x-2 disabled:opacity-100"
                variant="ghost"
                disabled={true}
              >
                <span className="capitalize">{columnName(id)}</span>
              </Button>
            </TableHead>
          );
        })}
        <TableHead className="sticky right-0 min-w-20 max-w-20 bg-card z-10" />
      </TableRow>
    </TableHeader>
  );
}
