import { TableHead, TableHeader, TableRow } from "@canny_ecosystem/ui/table";
import { cn } from "@canny_ecosystem/ui/utils/cn";

type Props = {
  table?: any;
  className?: string;
  loading?: boolean;
};

// make sure the order is same as header order
export const HolidaysColumnIdArray = [
  "name",
  "start_date",
  "no_of_days",
  "is_mandatory",
];

export function HolidaysTableHeader({ table, className, loading }: Props) {
  const isVisible = (id: string) =>
    loading ||
    table
      ?.getAllLeafColumns()
      ?.find((col: any) => {
        return col.id === id;
      })
      ?.getIsVisible();

  const columnName = (id: string) =>
    loading ||
    table?.getAllLeafColumns()?.find((col: { id: string }) => {
      return col.id === id;
    })?.columnDef?.header;

  return (
    <TableHeader className={className}>
      <TableRow className="h-[45px] hover:bg-transparent">
        {HolidaysColumnIdArray?.map((id) => {
          return (
            isVisible(id) && (
              <TableHead key={id} className={cn("px-4 py-2")}>
                <span className="capitalize">{columnName(id)}</span>
              </TableHead>
            )
          );
        })}
        <TableHead className="sticky right-0 min-w-20 max-w-20 bg-card z-10" />
      </TableRow>
    </TableHeader>
  );
}
