import type { ColumnDef } from "@tanstack/react-table";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { deleteRole, hasPermission, updateRole } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { SalaryEntriesWithEmployee } from "@canny_ecosystem/supabase/queries";
import { SalaryEntryDropdown } from "../salary-entry-dropdown";

export const salaryEntryColumns: ColumnDef<SalaryEntriesWithEmployee>[] = [
  {
    enableSorting: false,
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28 text-primary">{`${row.original?.employee_code ?? "--"}`}</p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize w-48 text-primary">{`${row.original?.first_name
          } ${row.original?.middle_name ?? ""} ${row.original?.last_name ?? ""
          }`}</p>
      );
    },
  },
  {
    accessorKey: "actions",
    cell: ({ row }) => {
      const { role } = useUser();
      return <SalaryEntryDropdown data={row.original} triggerChild={<DropdownMenuTrigger
        asChild
        className={cn(
          "flex",
          !hasPermission(role, `${updateRole}:${attribute.payroll}`) &&
          !hasPermission(
            role,
            `${deleteRole}:${attribute.employees}`
          ) &&
          "hidden",
        )}
      >
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <Icon name="dots-vertical" />
        </Button>
      </DropdownMenuTrigger>} />
    }
  }
];
