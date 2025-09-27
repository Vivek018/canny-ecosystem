import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";
import type { EmployeeDataType } from "@canny_ecosystem/supabase/queries";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";

export const columns = (): ColumnDef<EmployeeDataType>[] => [
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
        <p className="truncate w-28 capitalize">
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
        <p className="truncate w-28 capitalize">
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
          {replaceUnderscore(row.original?.work_details[0]?.assignment_type ?? "")}
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
        <p className="truncate capitalize">
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
        <p className="capitalize">
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
        <p className="w-max capitalize">
          {row.original?.work_details[0]?.start_date
            ? String(formatDate(row.original?.work_details[0]?.start_date))
            : ""}
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
          {row.original?.work_details[0]?.end_date
            ? String(formatDate(row.original?.work_details[0]?.end_date))
            : ""}
        </p>
      );
    },
  },
];
