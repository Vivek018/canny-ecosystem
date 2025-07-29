import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import {
  deleteRole,
  formatDate,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { CasesDatabaseRow } from "@canny_ecosystem/supabase/types";
import { CaseOptionsDropdown } from "./cases-table-options";

export const columns: ColumnDef<CasesDatabaseRow>[] = [
  {
    id: "select",
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "title",
    cell: ({ row }) => {
      return (
        <p className="truncate w-52 text-primary">
          {row.original?.title ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <p className="truncate w-52">{row.original?.description ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return (
        <p className="truncate">
          {(formatDate(row.original?.date) ?? "--").toString()}
        </p>
      );
    },
  },
  {
    accessorKey: "case_type",
    header: "Case Type",
    cell: ({ row }) => {
      return (
        <p className=" truncate capitalize">
          {row.original?.case_type ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "status",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize ">{row.original?.status ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "incident_date",
    header: "Incident Date",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.incident_date ?? "--"}</p>;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original?.location_type === "other"
            ? row.original?.location
            : row.original?.location_type ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "resolution_date",
    header: "Resolution Date",
    cell: ({ row }) => {
      return (
        <p className="truncate ">{row.original.resolution_date ?? "--"}</p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "amount_given",
    header: "Amount Given",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original.amount_given ?? "--"}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "amount_received",
    header: "Amount Received",
    cell: ({ row }) => {
      return (
        <p className="truncate ">{row.original.amount_received ?? "--"}</p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "court_case_reference",
    header: "Court Case Reference",
    cell: ({ row }) => {
      return (
        <p className="truncate">{row.original.court_case_reference ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "reported_on",
    header: "Reported On",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original.reported_on ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "reported_by",
    header: "Reported By",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original.reported_by ?? "--"}
        </p>
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const { role } = useUser();

      return (
        <CaseOptionsDropdown
          key={row?.original?.id}
          caseId={row?.original?.id}
          documentUrl={row?.original?.document as string}
          caseTitle={row?.original?.title}
          triggerChild={
            <DropdownMenuTrigger
              className={cn(
                !hasPermission(role, `${updateRole}:${attribute.cases}`) &&
                  !hasPermission(role, `${deleteRole}:${attribute.cases}`) &&
                  "hidden",
              )}
              asChild
            >
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
