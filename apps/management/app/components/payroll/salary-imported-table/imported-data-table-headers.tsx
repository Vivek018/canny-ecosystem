import type { FieldConfig } from "@/routes/_protected+/payroll+/run-payroll+/import-salary-payroll+/_index";
import { Button } from "@canny_ecosystem/ui/button";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";

type Props = {
  table?: any;
  className?: string;
  loading?: boolean;
  fieldConfigs: FieldConfig[];
};

// make sure the order is same as header order

export function ImportedDataTableHeader({
  table,
  className,
  loading,
  fieldConfigs,
}: Props) {
  const ImportPayrollDataArray: string[] = ["sr_no"];

  for (const { key } of fieldConfigs) {
    const lowerKey = key.toLowerCase();
    if (!ImportPayrollDataArray.includes(lowerKey)) {
      ImportPayrollDataArray.push(lowerKey);
    }
  }

  const columnName = (id: string) =>
    loading ||
    table?.getAllLeafColumns()?.find((col: { id: string }) => {
      return col.id === id;
    })?.columnDef?.header;

  return (
    <TableHeader className={className}>
      <TableRow className="h-[45px] hover:bg-transparent">
        {ImportPayrollDataArray?.map((id) => {
          return (
            <TableHead key={id} className={cn("px-4 py-2")}>
              <Button
                className={cn(
                  "p-0 hover:bg-transparent space-x-2 disabled:opacity-100",
                )}
                variant="ghost"
                disabled={true}
              >
                <span className={cn("capitalize")}>{columnName(id)}</span>
              </Button>
            </TableHead>
          );
        })}
        <TableHead className="sticky right-0 min-w-20 max-w-20 bg-card z-10" />
      </TableRow>
    </TableHeader>
  );
}
