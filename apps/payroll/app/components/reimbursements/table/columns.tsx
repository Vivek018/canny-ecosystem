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
  updateRole,
} from "@canny_ecosystem/utils";
import { useUser } from "@/utils/user";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { attribute } from "@canny_ecosystem/utils/constant";

export const reimbursementsColumns = ({
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
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className='truncate'>
          {row.original?.employees?.employee_code ?? "--"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className='truncate w-48 group-hover:text-primary'>{`${
          row.original.employees?.first_name
        } ${row.original.employees?.middle_name ?? ""} ${
          row.original.employees?.last_name ?? ""
        }`}</p>
      );
    },
  },

  {
    accessorKey: "submitted_date",
    header: "Submitted Date",
    cell: ({ row }) => {
      return (
        <p className='truncate '>
          {formatDate(row.original?.submitted_date ?? "") ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <p className='truncate capitalize '>
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
      return <p className=' truncate'>{row.original?.amount ?? "--"}</p>;
    },
  },

  {
    accessorKey: "is_deductible",
    header: "Is Deductible",
    cell: ({ row }) => {
      return (
        <p className='truncate capitalize'>
          {String(row.original?.is_deductible) ?? "--"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "email",
    header: "Approved By",
    cell: ({ row }) => {
      return <p className=' truncate'>{row.original?.users?.email ?? "--"}</p>;
    },
  },
  {
    enableSorting: false,
    accessorKey: "project_name",
    header: "Project",
    cell: ({ row }) => {
      return (
        <p className='truncate '>
          {
            row.original.employees?.employee_project_assignment?.project_sites
              ?.projects?.name
          }
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "project_site_name",
    header: "Project Site",
    cell: ({ row }) => {
      return (
        <p className='truncate '>
          {
            row.original.employees?.employee_project_assignment?.project_sites
              ?.name
          }
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
        <ReimbursementOptionsDropdown
          key={row?.original?.id}
          reimbursementId={row?.original?.id}
          employeeId={row.original?.employees?.id}
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
                  "hidden"
              )}
              asChild
            >
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <Icon name='dots-vertical' />
              </Button>
            </DropdownMenuTrigger>
          }
        />
      );
    },
  },
];
