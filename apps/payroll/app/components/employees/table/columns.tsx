import {
  deleteRole,
  formatDate,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { Button } from "@canny_ecosystem/ui/button";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";
import type { EmployeeDataType } from "@canny_ecosystem/supabase/queries";
import { EmployeeOptionsDropdown } from "../employee-option-dropdown";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUserRole } from "@/utils/user";

export const columns = ({
  env,
  companyId,
}: {
  env: SupabaseEnv;
  companyId: string;
}): ColumnDef<EmployeeDataType>[] => [
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
    enableHiding: false,
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <Link to={`${row.original.id}`} prefetch="intent" className="group">
          <p className="truncate text-primary/80 group-hover:text-primary w-28">
            {row.original?.employee_code}
          </p>
        </Link>
      );
    },
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => {
      return (
        <Link to={`${row.original.id}`} prefetch="intent" className="group">
          <p className="truncate text-primary/80 w-48 group-hover:text-primary">{`${
            row.original?.first_name
          } ${row.original?.middle_name ?? ""} ${
            row.original?.last_name ?? ""
          }`}</p>
        </Link>
      );
    },
  },
  {
    accessorKey: "mobile_number",
    header: "Mobile Number",
    cell: ({ row }) => {
      return row.original?.primary_mobile_number;
    },
  },
  {
    accessorKey: "date_of_birth",
    header: "Date of Birth",
    cell: ({ row }) => {
      return formatDate(row.original?.date_of_birth);
    },
  },
  {
    accessorKey: "education",
    header: "Education",
    cell: ({ row }) => {
      return (
        <p className="truncate w-20 capitalize">
          {replaceUnderscore(row.original?.education ?? "")}
        </p>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      return <p className="capitalize">{row.original?.gender}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <p className="capitalize">
          {row.original?.is_active ? "Active" : "Inactive"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "project_name",
    header: "Project",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28 capitalize">
          {
            row.original?.employee_project_assignment?.project_sites?.projects
              ?.name
          }
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "project_site_name",
    header: "Project Site",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28 capitalize">
          {row.original?.employee_project_assignment?.project_sites?.name}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "assignment_type",
    header: "Assignment Type",
    cell: ({ row }) => {
      return (
        <p className="capitalize">
          {replaceUnderscore(
            row.original?.employee_project_assignment?.assignment_type ?? ""
          )}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => {
      return (
        <p className="w-40 truncate capitalize">
          {replaceUnderscore(
            row.original?.employee_project_assignment?.position
          )}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "skill_level",
    header: "Skill Level",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {replaceUnderscore(
            row.original?.employee_project_assignment?.skill_level ?? ""
          )}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "start_date",
    header: "Date of joining",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {row.original?.employee_project_assignment?.start_date &&
            formatDate(row.original?.employee_project_assignment?.start_date)}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "end_date",
    header: "Date of leaving",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {row.original?.employee_project_assignment?.end_date &&
            formatDate(row.original?.employee_project_assignment?.end_date)}
        </p>
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const { role } = useUserRole();
      return (
        <EmployeeOptionsDropdown
          key={row.original.id}
          employee={{
            id: row.original.id,
            is_active: row.original.is_active ?? false,
            companyId,
          }}
          triggerChild={
            <DropdownMenuTrigger
              asChild
              className={cn(
                !hasPermission(`${role}`, `${updateRole}:employees`) &&
                  !hasPermission(`${role}`, `${deleteRole}:employees`) &&
                  "hidden"
              )}
            >
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Icon name="dots-vertical" />
              </Button>
            </DropdownMenuTrigger>
          }
          env={env}
        />
      );
    },
  },
];
