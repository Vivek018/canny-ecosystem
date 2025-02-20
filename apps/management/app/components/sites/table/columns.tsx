import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";

export const columns = (projectId:string, siteId:string): ColumnDef<{ id: string; name: string }>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "name",
      header: "Linked Assignments",
      cell: ({ row }) => {
        return (
          <p
            onClick={() => {
              navigate(`/projects/${projectId}/${siteId}/manipulate-template?action=${modalSearchParamNames.update_link_template}&currentPaymentTemplateAssignmentId=${row.original.id}`);
            }}
            onKeyDown={() => {
              navigate(`/projects/${projectId}/${siteId}/manipulate-template?action=${modalSearchParamNames.update_link_template}&currentPaymentTemplateAssignmentId=${row.original.id}`);
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