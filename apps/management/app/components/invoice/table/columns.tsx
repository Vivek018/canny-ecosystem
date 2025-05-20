import { replaceUnderscore } from "@canny_ecosystem/utils";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";
import type { InvoiceDatabaseRow } from "@canny_ecosystem/supabase/types";
import { InvoiceOptionsDropdown } from "./invoice-options-dropdown";

export const columns: ColumnDef<InvoiceDatabaseRow>[] = [
  {
    accessorKey: "invoice_number",
    header: "Invoice Number",
    cell: ({ row }) => {
      return (
        <Link
          to={`/payroll/invoices/${row.original?.id}/preview-invoice`}
          prefetch="intent"
          className="group"
        >
          <p className="truncate text-primary/80 group-hover:text-primary w-38 capitalize">{`${replaceUnderscore(
            row.original?.invoice_number
          )}`}</p>
        </Link>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => {
      return (
        <p className="truncate w-96 capitalize">
          {replaceUnderscore(row.original?.subject ?? "")}
        </p>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Invoice Date",
    cell: ({ row }) => {
      return (
        <p className="truncate w-20">
          {new Date(row.original?.date).toLocaleDateString("en-IN") ?? "--"}
        </p>
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <InvoiceOptionsDropdown
          key={row.original.id}
          invoiceId={row.original.id}
          proofUrl={row.original.proof as string}
          invoiceNumber={row.original.invoice_number as string}
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
