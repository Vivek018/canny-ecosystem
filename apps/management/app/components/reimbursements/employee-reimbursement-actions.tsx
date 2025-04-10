import { ColumnVisibility } from "./column-visibility";
import { AddReimbursementDialog } from "./add-reimbursement-dialog";

export function EmployeeReimbursementActions({
  isEmpty,
}: { isEmpty: boolean }) {
  return (
    <div className="space-x-2 hidden md:flex">
      <ColumnVisibility disabled={isEmpty} />
      <AddReimbursementDialog />
    </div>
  );
}
