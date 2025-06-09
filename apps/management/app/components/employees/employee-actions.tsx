import { ColumnVisibility } from "@/components/employees/column-visibility";
import { AddEmployeeDialog } from "./add-employee-dialog";
import { useEmployeesStore } from "@/store/employees";
import EmployeesEmailMenu from "./employees-email-menu";

export function EmployeesActions({
  isEmpty,
  emails,
}: {
  isEmpty: boolean;
  emails: any[];
}) {
  const { columnVisibility, selectedRows } = useEmployeesStore();
  return (
    <div className="space-x-2 hidden md:flex">
      <ColumnVisibility disabled={isEmpty} />
      {/* <EmployeesEmailMenu
        emails={emails}
        selectedRows={selectedRows}
        columnVisibility={columnVisibility}
      /> */}
      <AddEmployeeDialog />
    </div>
  );
}
