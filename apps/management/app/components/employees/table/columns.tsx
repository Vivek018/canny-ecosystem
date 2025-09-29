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
import { EmployeeOptionsDropdown } from "../employee-option-dropdown";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

export const columns = ({
  companyId,
}: {
  env: SupabaseEnv;
  companyId: string;
}): ColumnDef<any>[] => [
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
        <Link to={`${row.original.id}`} prefetch="intent" className="group">
          <p className="truncate text-primary/80 group-hover:text-primary w-28">
            {row.original?.employee_code}
          </p>
        </Link>
      );
    },
  },
  {
    accessorKey: "first_name",
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
    accessorKey: "primary_mobile_number",
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
    accessorKey: "is_active",
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
        <p className="truncate capitalize">
          {row.original?.work_details[0]?.sites?.projects?.name}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "site_name",
    header: "Site",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original?.work_details[0]?.sites?.name}
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
            row.original?.work_details[0]?.assignment_type ?? "",
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
        <p className=" truncate capitalize">
          {replaceUnderscore(row.original?.work_details[0]?.position ?? "")}
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
        <p className="w-max capitalize truncate">
          {replaceUnderscore(row.original?.work_details[0]?.skill_level ?? "")}
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
        <p className="w-max capitalize truncate">
          {row.original?.work_details[0]?.start_date &&
            (formatDate(row.original?.work_details[0]?.start_date) as any)}
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
        <p className="w-max capitalize truncate">
          {row.original?.work_details[0]?.end_date &&
            (formatDate(row.original?.work_details[0]?.end_date) as any)}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "account_number",
    header: "Account Number",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize truncate">
          {row.original?.employee_bank_details?.account_number}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "bank_name",
    header: "Bank Name",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize truncate ">
          {row.original?.employee_bank_details?.bank_name}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "aadhaar_number",
    header: "Aadhaar Number",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize truncate ">
          {row.original?.employee_statutory_details?.aadhaar_number}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "pan_number",
    header: "Pan Number",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize truncate">
          {row.original?.employee_statutory_details?.pan_number}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "uan_number",
    header: "UAN Number",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize truncate">
          {row.original?.employee_statutory_details?.uan_number}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "pf_number",
    header: "PF Number",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize truncate">
          {row.original?.employee_statutory_details?.pf_number}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "esic_number",
    header: "ESIC Number",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize truncate">
          {row.original?.employee_statutory_details?.esic_number}
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
                !hasPermission(role, `${updateRole}:${attribute.employees}`) &&
                  !hasPermission(
                    role,
                    `${deleteRole}:${attribute.employees}`,
                  ) &&
                  "hidden",
              )}
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
