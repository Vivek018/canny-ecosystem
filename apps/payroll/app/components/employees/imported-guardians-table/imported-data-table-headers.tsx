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
  "relationship",
  "first_name",
  "last_name",
  "date_of_birth",
  "gender",
  "mobile_number",
  "alternate_mobile_number",
  "email",
  "is_emergency_contact",
  "address_same_as_employee",
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
