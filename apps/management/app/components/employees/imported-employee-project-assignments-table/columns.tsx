import type {
  ImportEmployeeDetailsDataType,
  ImportEmployeeProjectAssignmentsDataType,
} from "@canny_ecosystem/supabase/queries";
import { Button } from "@canny_ecosystem/ui/button";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import type { ColumnDef } from "@tanstack/react-table";
import { ImportedEmployeeProjectAssignmentsOptionsDropdown } from "./imported-table-options";

export const ImportedDataColumns: ColumnDef<ImportEmployeeProjectAssignmentsDataType>[] =
  [
    {
      accessorKey: "employee_code",
      header: "Employee Code",
      cell: ({ row }) => {
        return <p className="truncate ">{row.original.employee_code}</p>;
      },
    },
    {
      accessorKey: "site",
      header: "Site",
      cell: ({ row }) => {
        return <p className="truncate ">{row.original.site}</p>;
      },
    },
    {
      accessorKey: "assignment_type",
      header: "Assignment Type",
      cell: ({ row }) => {
        return (
          <p className="truncate ">{row.original?.assignment_type ?? "--"}</p>
        );
      },
    },

    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.start_date ?? "--"}</p>;
      },
    },

    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.end_date ?? "--"}</p>;
      },
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.position ?? "--"}</p>;
      },
    },
    {
      accessorKey: "skill_level",
      header: "Skill Level",
      cell: ({ row }) => {
        return <p className=" truncate">{row.original?.skill_level ?? "--"}</p>;
      },
    },
    {
      accessorKey: "probation_period",
      header: "Probation Period",
      cell: ({ row }) => {
        return (
          <p className="truncate group-hover:text-primary">
            {row.original.probation_period}
          </p>
        );
      },
    },
    {
      accessorKey: "probation_end_date",
      header: "Probation End Date",
      cell: ({ row }) => {
        return (
          <p className=" truncate">
            {row.original?.probation_end_date ?? "--"}
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
          <ImportedEmployeeProjectAssignmentsOptionsDropdown
            key={JSON.stringify(row.original)}
            index={row.index}
            data={row.original}
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
