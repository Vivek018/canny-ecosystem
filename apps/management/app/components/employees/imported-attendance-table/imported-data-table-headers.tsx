import { Button } from "@canny_ecosystem/ui/button";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";

type Props = {
  table?: any;
  className?: string;
  loading?: boolean;
};

// make sure the order is same as header order
export const ImportAttendanceDataArray = [
  "employee_code",
  "month",
  "year",
  "working_days",
  "present_days",
  "working_hours",
  "overtime_hours",
  "absent_days",
  "paid_holidays",
  "paid_leaves",
  "casual_leaves",
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
        {ImportAttendanceDataArray?.map((id) => {
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
