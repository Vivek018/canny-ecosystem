import { formatMonthYearDate } from "@canny_ecosystem/utils";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";

export type EPFReportType = {
  id: string;
  employee_code: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  pf_acc_number: string;
  uan: string;
  pf_wage: number;
  employee_pf_amount: number;
  employee_vpf_amount: number;
  employer_pf_amount: number;
  employer_eps_amount: number;
  employer_edli_contribution: number;
  employer_pf_admin_charges: number;
  total_contribution: number;
  start_date: string;
  end_date: string;
  work_details: {
    start_date: string;
    end_date: string;
    sites: {
      name: string;
      projects: { name: string };
    };
  };
};

export const columns = (): ColumnDef<EPFReportType>[] => [
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
    accessorKey: "pf_acc_number",
    header: "PF Account Number",
    cell: ({ row }) => {
      return (
        <p className="truncate w-40 capitalize">
          {row.original?.pf_acc_number}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "uan",
    header: "UAN",
    cell: ({ row }) => {
      return <p className="truncate w-40 capitalize">{row.original?.uan}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "pf_wage",
    header: "PF Wage",
    cell: ({ row }) => {
      return (
        <p className="truncate w-40 capitalize">{row.original?.pf_wage}</p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "employee_pf_amount",
    header: "Employee PF Amount",
    cell: ({ row }) => {
      return (
        <p className="truncate w-40 capitalize">
          {row.original?.employee_pf_amount}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "employee_vpf_amount",
    header: "Employee VPF Amount",
    cell: ({ row }) => {
      return (
        <p className="truncate w-40 capitalize">
          {row.original?.employee_vpf_amount}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "employer_pf_amount",
    header: "Employer PF Amount",
    cell: ({ row }) => {
      return (
        <p className="truncate w-40 capitalize">
          {row.original?.employer_pf_amount}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "employer_eps_amount",
    header: "Employer EPS Amount",
    cell: ({ row }) => {
      return (
        <p className="truncate w-40 capitalize">
          {row.original?.employer_eps_amount}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "employer_edli_contribution",
    header: "Employer EDLI",
    cell: ({ row }) => {
      return (
        <p className="truncate w-40 capitalize">
          {row.original?.employer_edli_contribution}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "employer_pf_admin_charges",
    header: "Employer PF admin charges",
    cell: ({ row }) => {
      return (
        <p className="truncate w-40 capitalize">
          {row.original?.employer_pf_admin_charges}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "total_contribution",
    header: "Total Contribution",
    cell: ({ row }) => {
      return (
        <p className="truncate w-40 capitalize">
          {row.original?.total_contribution}
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
        <p className="truncate w-40 capitalize">
          {row.original?.work_details[0]?.sites?.projects?.name}
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
        <p className="truncate w-40 capitalize">
          {row.original?.work_details[0]?.sites?.name}
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
