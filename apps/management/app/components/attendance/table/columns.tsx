import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { Link } from "@remix-run/react";
import { formatDate } from "@canny_ecosystem/utils";
import type { TransformedAteendanceDataType } from "@/routes/_protected+/time-tracking+/attendance+/_index";

export const attendanceColumns = (
  days: {
    day: number;
    fullDate: string;
  }[],
): ColumnDef<TransformedAteendanceDataType>[] => [
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

    cell: ({ row }) => (
      <Link
        to={`/employees/${row.original.employee_id}/attendance`}
        prefetch="intent"
        className="group"
      >
        <p className="truncate text-primary/80 w-28">
          {row.original?.employee_code ?? "--"}
        </p>
      </Link>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => (
      <Link
        to={`/employees/${row.original.employee_id}/attendance`}
        prefetch="intent"
        className="group"
      >
        <p className="truncate text-primary/80 w-48">
          {`${row.original.employee_name}`}
        </p>
      </Link>
    ),
  },
  {
    enableSorting: false,
    accessorKey: "project_name",
    header: "Project",
    cell: ({ row }) => <p className="truncate">{row.original.project}</p>,
  },
  {
    enableSorting: false,
    accessorKey: "project_site_name",
    header: "Project Site",
    cell: ({ row }) => <p className="truncate">{row.original.project_site}</p>,
  },
  ...days.map((day) => ({
    enableSorting: false,
    accessorKey: `${formatDate(day.fullDate.toString())}`,
    header: formatDate(day.fullDate.toString()),
    cell: ({ row }) => (
      <p className="truncate">
        {row.original[`${formatDate(day.fullDate)}`] ?? "--"}
      </p>
    ),
  })),
];
