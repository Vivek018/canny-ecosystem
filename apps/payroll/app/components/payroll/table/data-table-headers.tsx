import { Button } from "@canny_ecosystem/ui/button";
import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";

type Props = {
  table?: any;
  className?: string;
  loading?: boolean;
};

// make sure the order is same as header order
export const payrollFieldsColumnIdArray = [
  "name",
  "paid_days",
  "gross_pay",
  "taxes",
  "discount",
  "bonus",
  "email",
  "mobile_number",
  "reimbursements",
  "net_pay",
  "company_name",
  "site_name",
  "area",
];

export function PayrollTableHeader({ table, className, loading }: Props) {
  const columnName = (id: string) =>
    loading ||
    table?.getAllLeafColumns()?.find((col: any) => {
      return col.id === id;
    })?.columnDef?.header;

  return (
    <TableHeader className={className}>
      <TableRow className="h-[45px] hover:bg-transparent">
        {payrollFieldsColumnIdArray?.map((id) => {
          return (
            <TableHead
              key={id}
              className={cn(
                "px-4 py-2",
                id === "name" && "sticky left-0 bg-card z-10",
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
      </TableRow>
    </TableHeader>
  );
}
