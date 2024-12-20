import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { ReimbursementOptionsDropdown } from "./reimbursements-table-options";
import type {
  EmployeeDatabaseRow,
  ReimbursementRow,
  UserDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";

export type ReimbursementType = {
  id: ReimbursementRow["id"] | string;
  employee_name: Pick<EmployeeDatabaseRow, "id" | "first_name" | "last_name">;
  submitted_date: ReimbursementRow["submitted_date"] | string;
  status: ReimbursementRow["status"] | string;
  amount: ReimbursementRow["amount"] | string;
  is_deductible: ReimbursementRow["is_deductible"] | string;
  user_id: ReimbursementRow["user_id"] | number;
  users: Pick<UserDatabaseRow, "email">;
};

export const reimbursementsColumns = ({
  isEmployeeRoute = false,
}: {
  isEmployeeRoute?: boolean;
}): ColumnDef<ReimbursementType>[] => [
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
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize w-48">{`${
          row.original?.employee_name.first_name ?? "--"
        } ${row.original?.employee_name.last_name ?? "--"}`}</p>
      );
    },
  },
  {
    accessorKey: "submitted_date",
    header: "Submitted Date",
    cell: ({ row }) => {
      return (
        <p className="truncate ">{row.original?.submitted_date ?? "--"}</p>
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
    accessorKey: "is_deductible",
    header: "Is Deductible",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original?.is_deductible === undefined
            ? "--"
            : row.original?.is_deductible
            ? "true"
            : "false"}
        </p>
      );
    },
  },
  {
    accessorKey: "user_id",
    header: "Approved By",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.users?.email ?? "--"}</p>;
    },
  },

  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <ReimbursementOptionsDropdown
          key={row.original.id}
          reimbursementId={row.original.id}
          employeeId={row.original?.employee_name.id}
          isEmployeeRoute={isEmployeeRoute}
          triggerChild={
            <DropdownMenuTrigger asChild>
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
