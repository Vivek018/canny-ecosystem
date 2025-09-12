import { ColumnVisibility } from "./column-visibility";
import { AddCaseDialog } from "./add-case-dialog";

export function CaseActions({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <div>
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
        <AddCaseDialog />
      </div>
    </div>
  );
}
