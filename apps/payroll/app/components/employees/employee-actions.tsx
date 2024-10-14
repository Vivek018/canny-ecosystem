import { ColumnVisibility } from "@/components/employees/column-visibility";
import { AddEmployeeDialog } from "./add-employee-dialog";

export function EmployeesActions({ isEmpty }: { isEmpty: boolean }) {
  return (
    <div className="space-x-2 hidden md:flex">
      <ColumnVisibility disabled={isEmpty} />
      <AddEmployeeDialog />
    </div>
  );
}
