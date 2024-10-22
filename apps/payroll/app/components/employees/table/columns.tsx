import { formatDate, replaceDash } from "@canny_ecosystem/utils";
import { Button } from "@canny_ecosystem/ui/button";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";
import type { EmployeeDataType } from "@canny_ecosystem/supabase/queries";
import { EmployeeOptionsDropdown } from "../employee-option-dropdown";

export const columns: ColumnDef<EmployeeDataType>[] = [
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
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => {
      return (
        <Link to={`${row.original.id}`} prefetch="intent" className="group">
          <p className="truncate text-primary/80 w-48 group-hover:text-primary">{`${row.original?.first_name} ${row.original?.middle_name ?? ""} ${row.original?.last_name ?? ""}`}</p>
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
          {replaceDash(row.original?.education ?? "")}
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
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <EmployeeOptionsDropdown
          key={row.original.id}
          employee={{
            id: row.original.id,
            is_active: row.original.is_active ?? false,
          }}
          triggerChild={
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Icon name="dots" />
              </Button>
            </DropdownMenuTrigger>
          }
        />
      );
    },
  },
];
