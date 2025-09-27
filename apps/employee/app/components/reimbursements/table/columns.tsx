import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";
import Previewer from "@/utils/previewer";

export const columns = (): ColumnDef<ReimbursementDataType>[] => [
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
    accessorKey: "employee_name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <p className="truncate">
          {row.original.employee_id
            ? `${row.original.employees?.first_name} ${
                row.original.employees?.middle_name ?? ""
              } ${row.original.employees?.last_name ?? ""}`
            : `${row.original.payee?.name}`}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className="truncate">
          {row.original?.employees?.employee_code ?? "--"}
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
        <p className="truncate ">
          {row.original.employees?.work_details[0]?.sites?.projects?.name ??
            "--"}
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
        <p className="truncate ">
          {row.original.employees?.work_details[0]?.sites?.name ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "submitted_date",
    header: "Submitted Date",
    cell: ({ row }) => {
      return (
        <p className="truncate ">
          <> {formatDate(row.original?.submitted_date ?? "") ?? "--"}</>
        </p>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize ">
          {replaceUnderscore(row.original.type) ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize ">
          {row.original?.status
            ? row.original.status.toLowerCase() === "pending"
              ? `${row.original.status}`
              : row.original.status
            : "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.amount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      return (
        <Previewer label={"Note"} description={row.original?.note ?? "--"} />
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "email",
    header: "Approved By",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.users?.email ?? "--"}</p>;
    },
  },
];
