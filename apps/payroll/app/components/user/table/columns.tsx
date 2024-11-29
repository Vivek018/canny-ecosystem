import { replaceUnderscore } from "@canny_ecosystem/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { DataOptionsDropdown } from "./data-table-options";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@canny_ecosystem/ui/avatar";

export type Users = {
  avatar: string;
  id: string | "";
  first_name: string;
  last_name: string | "";
  email: string | "";
  mobile_number: number;
  is_active: boolean;
};

export const columns: ColumnDef<Users>[] = [
  {
    accessorKey: "avatar",
    cell: ({ row }) => {
      return (
        <Avatar className="rounded-full w-7 h-7 flex items-center justify-center bg-accent">
          <>
            <AvatarImage src={row.original?.avatar ?? ""} />
            <AvatarFallback className="rounded-md">
              <span className="text-md uppercase">
                {row.original.first_name.charAt(0)}
              </span>
            </AvatarFallback>
          </>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    cell: ({ row }) => {
      return (
        <p className="truncate w-20 capitalize">{`${row.original?.first_name}`}</p>
      );
    },
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    cell: ({ row }) => {
      return (
        <p className=" w-20 capitalize">
          {replaceUnderscore(row.original?.last_name ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <p className=" w-20">
          {replaceUnderscore(row.original?.email ?? "--")}
        </p>
      );
    },
  },
  {
    accessorKey: "mobile_number",
    header: "Mobile Number",
    cell: ({ row }) => {
      return (
        <p className="truncate w-32">{row.original?.mobile_number ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }) => {
      return (
        <p className="capitalize">
          {row.original?.is_active ? "Active" : "Inactive"}
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
        <DataOptionsDropdown
          key={row.original.id}
          id={row.original.id}
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
