import { ColumnVisibility } from "./column-visibility";
import { AddCaseDialog } from "./add-case-dialog";

export function CaseActions({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <div className="space-x-2 hidden md:flex">
      <ColumnVisibility disabled={isEmpty} />
      <AddCaseDialog />
    </div>
  );
}
