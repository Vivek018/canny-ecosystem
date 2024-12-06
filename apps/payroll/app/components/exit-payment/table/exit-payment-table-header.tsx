import { Button } from "@canny_ecosystem/ui/button";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";

type Props = {
  table?: any;
  className?: string;
  loading?: boolean;
};

// make sure the order is same as header order
export const ExitPaymentColumnIdArray = [
  "employee_name",
  "last_working_day",
  "reason_for_exit",
  "final_settlement_date",
  "organization_payable_days",
  "employee_payable_days",
  "bonus",
  "diwali_bonus",
  "commission",
  "joining_bonus",
  "yearly_bonus",
  "leave_encashment",
  "gift_coupon",
  "computer_service_charges",
  "gratuity",
  "deduction",
  "note",
] as const;

export type ExitPaymentColumnId = typeof ExitPaymentColumnIdArray[number];

export function ExitPaymentTableHeader({ table, className, loading }: Props) {
  const columnName = (id: string) =>
    loading ||
    table?.getAllLeafColumns()?.find((col: any) => {
      return col.id === id;
    })?.columnDef?.header;

  return (
    <TableHeader className={className}>
      <TableRow className="h-[45px] hover:bg-transparent">
        {ExitPaymentColumnIdArray?.map((id) => {
          return (
            <TableHead
              key={id}
              className={cn(
                "px-4 py-2",
                id === "employee_name" && "sticky left-0 bg-card z-10"
              )}
            >
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
