import { ColumnVisibility } from "@/components/employees/column-visibility";
import { AddEmployeeDialog } from "./add-employee-dialog";

export function EmployeesActions({
  isEmpty,
}: {
  isEmpty: boolean;
  emails?: any[];
}) {
  // const { columnVisibility, selectedRows } = useEmployeesStore();
  return (
    <div className="gap-4flex">
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
        {/* <EmployeesEmailMenu
        emails={emails}
        selectedRows={selectedRows}
        columnVisibility={columnVisibility}
      /> */}
        <AddEmployeeDialog />
      </div>
    </div>
  );
}
