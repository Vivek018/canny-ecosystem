import type { ExitDataType } from "@canny_ecosystem/supabase/queries";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@canny_ecosystem/ui/checkbox";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { ExitOptionsDropdown } from "../exit-option-dropdown";

export const ExitPaymentColumns: ColumnDef<ExitDataType>[] = [
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
      return (
        <p className="truncate text-primary/80 w-28 group-hover:text-primary">
          {row.original?.employees?.employee_code ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate text-primary/80 w-48 group-hover:text-primary">{`${
          row.original.employees?.first_name
        } ${row.original.employees?.middle_name ?? ""} ${
          row.original.employees?.last_name ?? ""
        }`}</p>
      );
    },
  },
  {
    accessorKey: "project_name",
    header: "Project Name",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original?.employees.employee_project_assignment.project_sites
            .projects.name ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "site_name",
    header: "Site Name",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original?.employees.employee_project_assignment.project_sites
            .name ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "last_working_day",
    header: "Last Working Day ",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">{`${
          row.original?.last_working_day ?? "--"
        }`}</p>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason for Exit",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">{row.original?.reason ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "final_settlement_date",
    header: "Final Settlement Date",
    cell: ({ row }) => {
      return (
        <p className="truncate  ">
          {row.original?.final_settlement_date ?? "--"}
        </p>
      );
    },
  },

  {
    accessorKey: "organization_payable_days",
    header: "Organization Payable Days",
    cell: ({ row }) => {
      return (
        <p className="truncate">
          {row.original?.organization_payable_days ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "employee_payable_days",
    header: "Employee Payable Days",
    cell: ({ row }) => {
      return (
        <p className="truncate">
          {row.original?.employee_payable_days ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "bonus",
    header: "Bonus",
    cell: ({ row }) => {
      const bonus = row.original.exit_payments.find(
        (p) => p.payment_fields.name === "bonus",
      );

      return <p className="capitalize truncate">{bonus?.amount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "diwali_bonus",
    header: "Diwali Bonus",
    cell: ({ row }) => {
      const diwali_bonus = row.original.exit_payments.find(
        (p) => p.payment_fields.name === "diwali_bonus",
      );

      return (
        <p className="capitalize truncate">{diwali_bonus?.amount ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "commision",
    header: "Commision",
    cell: ({ row }) => {
      const commision = row.original.exit_payments.find(
        (p) => p.payment_fields.name === "commision",
      );

      return <p className="capitalize truncate">{commision?.amount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "joining_bonus",
    header: "Joining Bonus",
    cell: ({ row }) => {
      const joining_bonus = row.original.exit_payments.find(
        (p) => p.payment_fields.name === "joining_bonus",
      );

      return (
        <p className="capitalize truncate">{joining_bonus?.amount ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "yearly_bonus",
    header: "Yearly Bonus",
    cell: ({ row }) => {
      const yearly_bonus = row.original.exit_payments.find(
        (p) => p.payment_fields.name === "yearly_bonus",
      );

      return (
        <p className="capitalize truncate">{yearly_bonus?.amount ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "leave_encashment",
    header: "Leave Encashment",
    cell: ({ row }) => {
      const leave_encashment = row.original.exit_payments.find(
        (p) => p.payment_fields.name === "leave_encashment",
      );

      return (
        <p className="capitalize truncate">
          {leave_encashment?.amount ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "gift_coupon",
    header: "Gift Coupon",
    cell: ({ row }) => {
      const gift_coupon = row.original.exit_payments.find(
        (p) => p.payment_fields.name === "gift_coupon",
      );

      return (
        <p className="capitalize truncate">{gift_coupon?.amount ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "gratuity",
    header: "Gratuity",
    cell: ({ row }) => {
      const gratuity = row.original.exit_payments.find(
        (p) => p.payment_fields.name === "gratuity",
      );

      return <p className="capitalize truncate">{gratuity?.amount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "computer_service_charges",
    header: "Computer Service Charges",
    cell: ({ row }) => {
      const computer_service_charges = row.original.exit_payments.find(
        (p) => p.payment_fields.name === "computer-service-charges",
      );

      return (
        <p className="capitalize truncate">
          {computer_service_charges?.amount ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "deduction",
    header: "Deduction",
    cell: ({ row }) => {
      const deduction = row.original.exit_payments.find(
        (p) => p.payment_fields.name === "deduction",
      );

      return <p className="capitalize truncate">{deduction?.amount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      return (
        <p className="capitalize truncate">{row.original?.total ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      return (
        <p className="capitalize truncate">{row.original?.note ?? "--"}</p>
      );
    },
  },

  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <ExitOptionsDropdown
          key={row.original.id}
          exitId={row.original.id}
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
