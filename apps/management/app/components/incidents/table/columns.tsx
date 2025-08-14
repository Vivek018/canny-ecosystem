import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { IncidentOptionsDropdown } from "./incidents-table-options";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import type { IncidentsDatabaseType } from "@canny_ecosystem/supabase/queries";
import {
  deleteRole,
  formatDate,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { attribute } from "@canny_ecosystem/utils/constant";
import Previewer from "@/utils/previewer";

export const columns: ColumnDef<IncidentsDatabaseType>[] = [
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
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">
          {row.original?.employees?.employee_code ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate w-48 group-hover:text-primary">{`${
          row.original.employees?.first_name
        } ${row.original.employees?.middle_name ?? ""} ${
          row.original.employees?.last_name ?? ""
        }`}</p>
      );
    },
  },
  {
    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">
          {row.original?.employees?.employee_project_assignment?.sites?.projects
            ?.name ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "site",
    header: "Site",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">
          {row.original?.employees?.employee_project_assignment?.sites?.name ??
            "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.title ?? "--"}</p>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <Previewer
          label={"Description"}
          description={row.original?.description ?? "--"}
        />
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return (
        <p className="truncate ">
          {(formatDate(row.original?.date ?? "") ?? "--").toString()}
        </p>
      );
    },
  },
  {
    accessorKey: "location_type",
    header: "Location Type",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize ">
          {row.original?.location_type ?? "--"}
        </p>
      );
    },
  },

  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">{row.original?.location ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.category ?? "--"}</p>;
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.severity ?? "--"}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.status ?? "--"}</p>;
    },
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
    cell: ({ row }) => {
      return (
        <Previewer
          label={"Diagnosis"}
          description={row.original?.diagnosis ?? "--"}
        />
      );
    },
  },
  {
    accessorKey: "action_taken",
    header: "Action Taken",
    cell: ({ row }) => {
      return (
        <Previewer
          label={"Action Taken"}
          description={row.original?.action_taken ?? "--"}
        />
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
        <IncidentOptionsDropdown
          key={row?.original?.id}
          incidentId={row?.original?.id}
          triggerChild={
            <DropdownMenuTrigger
              className={cn(
                !hasPermission(role, `${updateRole}:${attribute.incidents}`) &&
                  !hasPermission(
                    role,
                    `${deleteRole}:${attribute.incidents}`
                  ) &&
                  "hidden"
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
