import type { ExitDataType } from "@canny_ecosystem/supabase/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { ExitOptionsDropdown } from "../exit-option-dropdown";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ExitsRow } from "@canny_ecosystem/supabase/types";

export const ExitPaymentColumns: ColumnDef<ExitsRow & ExitDataType>[] = [
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
      return <p className="truncate text-primary/80 w-28 cursor-pointer">
        {row.original?.employees?.employee_code ?? "--"}
      </p>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return <p className="truncate text-primary/80 w-32 cursor-pointer">
        {`${row.original.employees?.first_name} ${row.original.employees?.middle_name ?? ""}
           ${row.original.employees?.last_name ?? ""}`}
      </p>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      return <p className="truncate capitalize">
        {row.original?.employees.employee_project_assignment.project_sites.projects.name ?? "--"}
      </p>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "project_site",
    header: "Project Site",
    cell: ({ row }) => {
      return <p className="truncate capitalize">
        {row.original?.employees.employee_project_assignment.project_sites.name ?? "--"}
      </p>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "last_working_day",
    header: "Last Working Day ",
    cell: ({ row }) => {
      return <p className="truncate capitalize">{`${row.original?.last_working_day ?? "--"}`}</p>
    },
  },
  {
    accessorKey: "reason",
    header: "Reason for Exit",
    cell: ({ row }) => {
      return <p className="truncate capitalize">{row.original?.reason ?? "--"}</p>
    },
  },
  {
    accessorKey: "final_settlement_date",
    header: "Final Settlement Date",
    cell: ({ row }) => {
      return <p className="truncate  ">{row.original?.final_settlement_date ?? "--"}</p>
    },
  },
  {
    accessorKey: "organization_payable_days",
    header: "Organization Payable Days",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.organization_payable_days ?? "--"}</p>
    },
  },
  {
    accessorKey: "employee_payable_days",
    header: "Employee Payable Days",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.employee_payable_days ?? "--"}</p>
    },
  },
  {
    accessorKey: "bonus",
    header: "Bonus",
    cell: ({ row }) => {
      return <p className="capitalize truncate">{row.original.bonus ?? "--"}</p>;
    },
  },
  {
    accessorKey: "leave_encashment",
    header: "Leave Encashment",
    cell: ({ row }) => {
      return <p className="capitalize truncate">{row.original.leave_encashment ?? "--"}</p>
    },
  },
  {
    accessorKey: "gratuity",
    header: "Gratuity",
    cell: ({ row }) => {
      return <p className="capitalize truncate">{row.original.gratuity ?? "--"}</p>;
    },
  },
  {
    accessorKey: "deduction",
    header: "Deduction",
    cell: ({ row }) => {
      return <p className="capitalize truncate">{row.original.deduction ?? "--"}</p>;
    },
  },
  {
    accessorKey: "net_pay",
    header: "Net Pay",
    cell: ({ row }) => {
      const netPay = Number(row.original.bonus) + Number(row.original.leave_encashment) + Number(row.original.gratuity) - Number(row.original.deduction);
      return <p className="capitalize truncate">{netPay ?? "--"}</p>
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      return <p className="capitalize truncate">{row.original?.note ?? "--"}</p>
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const { role } = useUser();
      return (
        <ExitOptionsDropdown
          key={row.original.id}
          exitId={row.original.id}
          triggerChild={
            <DropdownMenuTrigger
              asChild
              className={cn(
                !hasPermission(role, `${updateRole}:${attribute.exits}`) &&
                !hasPermission(role, `${deleteRole}:${attribute.exits}`) &&
                "hidden"
              )}
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
