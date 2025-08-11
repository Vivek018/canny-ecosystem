import { formatDate, replaceUnderscore } from "@canny_ecosystem/utils";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@remix-run/react";
import { InvoiceOptionsDropdown } from "./invoice-options-dropdown";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import type { InvoiceDataType } from "@canny_ecosystem/supabase/queries";

export const columns: ColumnDef<InvoiceDataType>[] = [
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
    accessorKey: "invoice_number",
    header: "Invoice Numer",
    cell: ({ row }) => {
      return (
        <Link
          to={`/payroll/invoices/${row.original?.id}/preview-invoice`}
          prefetch="intent"
          className="group"
        >
          <p className="truncate text-primary/80 group-hover:text-primary capitalize">{`${replaceUnderscore(
            row.original?.invoice_number
          )}`}</p>
        </Link>
      );
    },
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {replaceUnderscore(row.original?.subject ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Invoice Date",
    cell: ({ row }) => {
      return (
        <p className="truncate ">
          {new Date(row.original?.date).toLocaleDateString("en-IN") ?? "--"}
        </p>
      );
    },
  },
  {
    enableSorting: false,
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      return (
        <p className="truncate ">
          {replaceUnderscore(row.original?.company_locations?.name ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {replaceUnderscore(row.original?.type ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "service_charge",
    header: "Is Service Charge Included",
    cell: ({ row }) => {
      return (
        <p className="truncate">
          {row.original?.include_charge ? "True" : "False"}
        </p>
      );
    },
  },
  {
    accessorKey: "is_paid",
    header: "Is Paid",
    cell: ({ row }) => {
      return (
        <p className="truncate">{row.original?.is_paid ? "True" : "False"}</p>
      );
    },
  },
  {
    accessorKey: "paid_date",
    header: "Paid Date",
    cell: ({ row }) => {
      return (
        <p className="truncate">
          {(formatDate(row.original?.paid_date) ?? "--").toString()}
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
          hide={row.original.is_paid}
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
