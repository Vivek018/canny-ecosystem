import { ColumnVisibility } from "./column-visibility";
import { AddReimbursementDialog } from "./add-reimbursement-dialog";

export function EmployeeReimbursementActions({
  isEmpty,
}: {
  isEmpty: boolean;
}) {
  return (
    <div className="gap-2 flex max-sm:justify-end max-sm:w-full">
      <ColumnVisibility disabled={isEmpty} />
      <AddReimbursementDialog />
    </div>
  );
}
