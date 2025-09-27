import {
  deleteRole,
  hasPermission,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { PayeeOptionsDropdown } from "./payee-options-dropdown";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { PayeeDatabaseRow } from "@canny_ecosystem/supabase/types";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import { attribute } from "@canny_ecosystem/utils/constant";

export type PayeeType = {
  id: PayeeDatabaseRow["id"] | string;
  name: PayeeDatabaseRow["name"] | string;
  bank_name: PayeeDatabaseRow["bank_name"] | string;
  account_holder_name: PayeeDatabaseRow["account_holder_name"] | string;
  account_number: PayeeDatabaseRow["account_number"] | string;
  ifsc_code: PayeeDatabaseRow["ifsc_code"] | string;
  branch_name: PayeeDatabaseRow["branch_name"] | string;
  account_type: PayeeDatabaseRow["account_type"] | string;
  aadhaar_number: PayeeDatabaseRow["aadhaar_number"] | string;
  pan_number: PayeeDatabaseRow["pan_number"] | string;
  fixed_amount: PayeeDatabaseRow["fixed_amount"] | string;
  type: PayeeDatabaseRow["type"] | string;
};

export const columns: ColumnDef<PayeeType>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <p className="truncate w-28">{`${row.original?.name}`}</p>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return <p className="truncate capitalize">{row.original?.type}</p>;
    },
  },
  {
    accessorKey: "fixed_amount",
    header: "Fixed Amount",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.fixed_amount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "account_number",
    header: "Account Number",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28 ">
          {replaceUnderscore(row.original?.account_number ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "bank_name",
    header: "Bank Name",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">
          {replaceUnderscore(row.original?.bank_name)}
        </p>
      );
    },
  },
  {
    accessorKey: "account_holder_name",
    header: "Account holder name",
    cell: ({ row }) => {
      return (
        <p className="truncate w-28">
          {replaceUnderscore(row.original?.account_holder_name ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "ifsc_code",
    header: "IFSC Code",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.ifsc_code ?? "--"}</p>;
    },
  },
  {
    accessorKey: "branch_name",
    header: "Branch Name",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.branch_name ?? "--"}</p>;
    },
  },
  {
    accessorKey: "account_type",
    header: "Account Type",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.account_type ?? "--"}</p>;
    },
  },
  {
    accessorKey: "aadhaar_number",
    header: "Aadhaar Number",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.aadhaar_number ?? "--"}</p>;
    },
  },
  {
    accessorKey: "pan_number",
    header: "PAN Number",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.pan_number ?? "--"}</p>;
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const { role } = useUser();
      return (
        <PayeeOptionsDropdown
          key={row.original.id}
          id={row.original.id}
          triggerChild={
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 w-8 p-0",
                  !hasPermission(
                    role,
                    `${updateRole}:${attribute.settingPayee}`
                  ) &&
                    !hasPermission(
                      role,
                      `${deleteRole}:${attribute.settingPayee}`
                    ) &&
                    "hidden"
                )}
              >
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
