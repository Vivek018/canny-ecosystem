import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { ReimbursementOptionsDropdown } from "./reimbursements-table-options";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import type { ReimbursementDataType } from "@canny_ecosystem/supabase/queries";
import {
  deleteRole,
  formatDate,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { attribute } from "@canny_ecosystem/utils/constant";
import Previewer from "@/utils/previewer";
import { Link } from "@remix-run/react";

export const columns = ({
  isEmployeeRoute = false,
}: {
  isEmployeeRoute?: boolean;
}): ColumnDef<ReimbursementDataType>[] => [
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
      return row.original.employee_id ? (
        <Link
          to={`/employees/${row.original.employee_id}/reimbursements`}
          prefetch="intent"
          className="group"
        >
          <p className="truncate text-primary/80 group-hover:text-primary ">
            {row.original?.employees?.employee_code ?? "--"}
          </p>
        </Link>
      ) : (
        <p>--</p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "payee_code",
    header: "Payee Code",
    cell: ({ row }) => {
      return row.original.payee_id ? (
        <Link to={"/settings/payee"} prefetch="intent" className="group">
          <p className="truncate text-primary/80 group-hover:text-primary ">
            {row.original.payee?.payee_code ?? "--"}
          </p>
        </Link>
      ) : (
        <p>--</p>
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
          {row.original.employees?.employee_project_assignment?.sites?.projects
            ?.name ?? "--"}
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
          {row.original.employees?.employee_project_assignment?.sites?.name ??
            "--"}
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
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const { role } = useUser();

      return (
        <ReimbursementOptionsDropdown
          key={row?.original?.id}
          reimbursementId={row?.original?.id}
          employeeId={row.original?.employee_id!}
          hideOptions={!!row.original.invoice_id?.length}
          isEmployeeRoute={isEmployeeRoute}
          triggerChild={
            <DropdownMenuTrigger
              className={cn(
                !hasPermission(
                  role,
                  `${updateRole}:${attribute.reimbursements}`
                ) &&
                  !hasPermission(
                    role,
                    `${deleteRole}:${attribute.reimbursements}`
                  ) &&
                  "hidden",
                !!row.original.invoice_id?.length && "hidden"
              )}
              asChild
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
