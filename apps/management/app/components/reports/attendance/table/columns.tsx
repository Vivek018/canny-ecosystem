import { Checkbox } from "@canny_ecosystem/ui/checkbox";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";
import type {
  AttendanceReportDataType,
  AttendanceReportFilters,
} from "@canny_ecosystem/supabase/queries";

export type AttendanceReport = AttendanceReportDataType & {
  start_date: string;
  end_date: string;
};
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

export const columns = (
  monthYearArray: any,
  filters: AttendanceReportFilters
): ColumnDef<AttendanceReport>[] => [
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
        <Link
          to={`/employees/${row.original.id}/attendance`}
          prefetch="intent"
          className="group"
        >
          <p className="truncate text-primary/80 group-hover:text-primary w-28">
            {row.original?.employee_code}
          </p>
        </Link>
      );
    },
  },
  {
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <Link
          to={`/employees/${row.original.id}/attendance`}
          prefetch="intent"
          className="group"
        >
          <p className="truncate text-primary/80 w-40 group-hover:text-primary">{`${
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
    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
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
        <p className="truncate capitalize">
          {row.original?.employee_project_assignment?.project_sites?.name}
        </p>
      );
    },
  },
  ...monthYearArray.map((monthYear: string) => ({
    enableSorting: false,
    accessorKey: monthYear,
    header: monthYear || "",
    cell: ({ row }: { row: any }) => {
      const attendanceForMonth = row.original.attendance?.[monthYear] || [];
      return <p className="truncate">{attendanceForMonth.length || "--"}</p>;
    },
  })),

  {
    enableSorting: false,
    accessorKey: "start_range",
    header: "Start Range",
    cell: () => {
      return (
        <p className="w-max capitalize">
          {filters?.start_year
            ? `${filters?.start_month?.slice(0, 3)} ${filters?.start_year}`
            : `Jan ${currentYear}`}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "end_range",
    header: "End Range",
    cell: () => {
      return (
        <p className="w-max capitalize">
          {filters?.end_year
            ? `${filters?.end_month?.slice(0, 3)} ${filters?.end_year}`
            : `Dec ${currentYear}`}
        </p>
      );
    },
  },
];
