import { replaceUnderscore } from "@canny_ecosystem/utils";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import type { PaymentTemplateDatabaseRow } from "@canny_ecosystem/supabase/types";
import { PaymentTemplateOptionsDropdown } from "../payment-template-options-dropdown";

export const columns: ColumnDef<
  Omit<PaymentTemplateDatabaseRow, "created_at" | "updated_at">
>[] = [
  {
    accessorKey: "name",
    header: "Template Name",
    cell: ({ row }) => {
      return <p className="truncate w-48">{`${row.original?.name ?? "--"}`}</p>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <p className="truncate w-96">{`${
          row.original?.description ?? "--"
        }`}</p>
      );
    },
  },
  {
    accessorKey: "monthly_ctc",
    header: "Monthly CTC",
    cell: ({ row }) => {
      return (
        <p className="truncate w-20 capitalize">
          {row.original?.monthly_ctc ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => {
      return (
        <p className="truncate w-32 capitalize">
          {replaceUnderscore(row.original?.state ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      return (
        <p className="capitalize">
          {row.original?.is_active ? "Active" : "Inactive"}
        </p>
      );
    },
  },
  {
    accessorKey: "is_default",
    header: "Is Default",
    cell: ({ row }) => {
      return (
        <p className="capitalize">{row.original?.is_default ? "Yes" : "No"}</p>
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <PaymentTemplateOptionsDropdown
          key={row.original.id}
          paymentTemplate={{
            id: row.original.id,
          }}
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
