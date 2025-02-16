import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { AccidentOptionsDropdown } from "./accidents-table-options";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import type { AccidentsDatabaseType } from "@canny_ecosystem/supabase/queries";
import {
  deleteRole,
  formatDate,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { attribute } from "@canny_ecosystem/utils/constant";

export const columns: ColumnDef<AccidentsDatabaseType>[] = [
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
    enableSorting: false,
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
    enableSorting: false,
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
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return (
        <p className="truncate ">
          {formatDate(row.original?.date ?? "") ?? "--"}
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
    enableSorting: false,
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.category ?? "--"}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original.severity ?? "--"}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original.status ?? "--"}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original.description ?? "--"}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "medical_diagnosis",
    header: "Medical Diagnosis",
    cell: ({ row }) => {
      return (
        <p className="truncate ">{row.original.medical_diagnosis ?? "--"}</p>
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
        <AccidentOptionsDropdown
          key={row?.original?.id}
          accidentId={row?.original?.id}
          triggerChild={
            <DropdownMenuTrigger
              className={cn(
                !hasPermission(role, `${updateRole}:${attribute.accidents}`) &&
                  !hasPermission(
                    role,
                    `${deleteRole}:${attribute.accidents}`,
                  ) &&
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
