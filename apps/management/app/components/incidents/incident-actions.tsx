import { ColumnVisibility } from "./column-visibility";

export function IncidentActions({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <div className="gap-4 hidden md:flex">
      <div className="flex gap-2">
        <ColumnVisibility disabled={isEmpty} />
      </div>
    </div>
  );
}
