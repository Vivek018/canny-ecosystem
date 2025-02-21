import type { ColumnDef } from "@tanstack/react-table";
import { SiteOptionsDropdown } from "../site-options-dropdown";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { PaymentTemplateAssignmentsDatabaseRow } from "@canny_ecosystem/supabase/types";

export const columns = (projectId: string, siteId: string): ColumnDef<PaymentTemplateAssignmentsDatabaseRow>[] => {
  return [
    {
      accessorKey: "name",
      header: "Linked Assignment Name",
      cell: ({ row }) => {
        return row.original?.name ?? "--";
      },
    },
    {
      accessorKey: "assignment_type",
      header: "Assignment Type",
      cell: ({ row }) => {
        return row.original?.assignment_type ?? "--";
      },
    },
    {
      accessorKey: "eligibility_option",
      header: "Eligibility Option",
      cell: ({ row }) => {
        return row.original?.eligibility_option ?? "--";
      },
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => {
        return row.original?.position ?? "--";
      },
    },
    {
      accessorKey: "skill_level",
      header: "Skill Level",
      cell: ({ row }) => {
        return row.original?.skill_level ?? "--";
      },
    },
    {
      accessorKey: "effective_from",
      header: "Effective From",
      cell: ({ row }) => {
        return row.original?.effective_from ?? "--";
      },
    },
    {
      accessorKey: "effective_to",
      header: "Effective To",
      cell: ({ row }) => {
        return row.original?.effective_to ?? "--";
      },
    },
    {
      accessorKey: "is_active",
      header: "Is Active",
      cell: ({ row }) => {
        return row.original?.is_active ? "Active" : "Inactive";
      },
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <SiteOptionsDropdown
            key={row.original.id}
            projectId={projectId}
            siteId={siteId}
            currentPaymentTemplateAssignmentId={row.original.id}
            triggerChild={
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <Icon name="dots-vertical" />
                </Button>
              </DropdownMenuTrigger>
            }
          />
        );
      },
    },
  ];
};