import { formatMonthYearDate } from "@canny_ecosystem/utils";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";

export type PaymentFieldsReportType = {
  id: string;
  employee_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  field_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  employee_project_assignment: {
    start_date: string;
    end_date: string;
    project_sites: {
      name: string;
      projects: { name: string };
    };
  };
};

export const columns = (): ColumnDef<PaymentFieldsReportType>[] => [
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
        <Link to={`/employees/${row.original.id}`} prefetch="intent" className="group">
          <p className="truncate text-primary/80 group-hover:text-primary w-28">
            {row.original?.employee_code}
          </p>
        </Link>
      );
    },
  },
  {
    accessorKey: "employee_name",
    header: "Full Name",
    cell: ({ row }) => {
      return (
        <Link to={`/employees/${row.original.id}`} prefetch="intent" className="group">
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
    enableSorting: false,
    accessorKey: "field_name",
    header: "Field Name",
    cell: ({ row }) => {
      return (
        <p className="truncate w-48 capitalize">{row.original?.field_name}</p>
      );
    }
  },
  {
    enableSorting: false,
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return <p className="truncate w-28 capitalize">{row.original?.amount}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "project",
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
    accessorKey: "project_site",
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
    accessorKey: "start_range",
    header: "Start Range",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {row.original?.start_date &&
            formatMonthYearDate(row.original?.start_date)}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "end_range",
    header: "End Range",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {row.original?.end_date &&
            formatMonthYearDate(row.original?.end_date)}
        </p>
      );
    },
  },
];
