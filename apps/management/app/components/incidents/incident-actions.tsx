import { ColumnVisibility } from "./column-visibility";

export function IncidentActions({ isEmpty }: { isEmpty?: boolean }) {
  return (
    <div className="space-x-2 hidden md:flex">
      <ColumnVisibility disabled={isEmpty} />
    </div>
  );
}
