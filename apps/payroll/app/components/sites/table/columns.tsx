import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { useSearchParams } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";

export const columns = (): ColumnDef<{ id: string; name: string }>[] => {
  const [searchParams, setSearchParams] = useSearchParams();
  return [
    {
      accessorKey: "name",
      header: "Template name",
      cell: ({ row }) => {
        return (
          <p
            onClick={() => {
              searchParams.set(
                "currentPaymentTemplateAssignmentId",
                row.original.id,
              );

              searchParams.set(
                "action",
                modalSearchParamNames.update_link_template,
              );
              setSearchParams(searchParams);
            }}
            onKeyDown={() => {
              searchParams.set(
                "currentPaymentTemplateAssignmentId",
                row.original.id,
              );

              searchParams.set(
                "action",
                modalSearchParamNames.update_link_template,
              );
              setSearchParams(searchParams);
            }}
            className="truncate w-48 hover:cursor-pointer hover:text-primary"
          >
            {`${row.original?.name}`}
          </p>
        );
      },
    },
  ];
};
