import { ColumnVisibility } from "./column-visibility";
import { AddCaseDialog } from "./add-case-dialog";

export function CaseActions({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <div className="gap-4 flex max-sm:justify-end max-sm:w-full">
      <ColumnVisibility disabled={isEmpty} />
      <AddCaseDialog />
    </div>
  );
}
