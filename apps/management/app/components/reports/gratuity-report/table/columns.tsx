import { formatDate } from "@canny_ecosystem/utils";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";

export type GratuityReportType = {
  id: string;
  employee_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  first_year: number;
  second_year: number;
  third_year: number;
  fourth_year: number;
  fifth_year: number;
  is_eligible_for_gratuity: boolean;
  employee_eligible_date: string;
  employee_project_assignment: {
    start_date: string;
    end_date: string;
    sites: {
      name: string;
      projects: { name: string };
    };
  };
};

export const columns = (): ColumnDef<GratuityReportType>[] => [
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
    accessorKey: "employee_name",
    header: "Full Name",
    cell: ({ row }) => {
      return (
        <Link to={`${row.original.id}`} prefetch="intent" className="group">
          <p className="truncate text-primary/80 w-48 group-hover:text-primary">{`${row.original?.first_name
            } ${row.original?.middle_name ?? ""} ${row.original?.last_name ?? ""
            }`}</p>
        </Link>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "first_year",
    header: "First Year",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {row.original?.first_year ? row.original?.first_year : "N/A"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "second_year",
    header: "Second Year",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {row.original?.second_year ? row.original?.second_year : "N/A"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "third_year",
    header: "Third Year",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {row.original?.third_year ? row.original?.third_year : "N/A"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "fourth_year",
    header: "Fourth Year",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {row.original?.fourth_year ? row.original?.fourth_year : "N/A"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "fifth_year",
    header: "Fifth Year",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {row.original?.fifth_year ? row.original?.fifth_year : "N/A"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "employee_eligible_date",
    header: "Date of Eligibility",
    cell: ({ row }) => {
      return (
        <p className="w-max capitalize">
          {row.original?.employee_eligible_date &&
            formatDate(row.original?.employee_eligible_date)}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "is_eligible_for_gratuity",
    header: "Eligible for Gratuity",
    cell: ({ row }) => {
      return (
        <p className="capitalize">
          {row.original?.is_eligible_for_gratuity ? "Yes" : "No"}
        </p>
      );
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
            row.original?.employee_project_assignment?.sites?.projects
              ?.name
          }
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "site",
    header: "Site",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28 capitalize">
          {row.original?.employee_project_assignment?.sites?.name}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "date_of_joining",
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
    accessorKey: "date_of_leaving",
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
];
