import { useSearchParams } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";

export const columns = (): ColumnDef<{ id: string, name: string }>[] => {
  const [searchParams, setSearchParams] = useSearchParams();
  return [
    {
      accessorKey: "name",
      header: "Template name",
      cell: ({ row }) => {
        return <p
          onClick={() => {
            const updatedSearchParams = new URLSearchParams(searchParams);
            updatedSearchParams.set("currentPaymentTemplateAssignmentId", row.original.id);

            updatedSearchParams.set("action", "update");
            setSearchParams(updatedSearchParams);
          }}
          onKeyDown={() => {
            const updatedSearchParams = new URLSearchParams(searchParams);
            updatedSearchParams.set("currentPaymentTemplateAssignmentId", row.original.id);

            updatedSearchParams.set("action", "update");
            setSearchParams(updatedSearchParams);
          }}
          className="truncate w-48 hover:cursor-pointer hover:text-primary">
          {`${row.original?.name}`}
        </p>
      },
    }
  ];
} 
