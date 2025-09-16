import { ColumnVisibility } from "./column-visibility";

export function IncidentActions({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <div className="gap-4 flex max-sm:justify-end max-sm:w-full">
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
      </div>
    </div>
  );
}
