export const ExitPaymentColumns = [
  {
    accessorKey: "employee_name",
    header: "Employee Name",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize w-48">{`${
          row.original?.employee_name ?? "--"
        }`}</p>
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
    accessorKey: "reason_for_exit",
    header: "Reason for Exit",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize">
          {row.original?.reason_for_exit ?? "--"}
        </p>
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
      return <p className="truncate">{row.original?.bonus ?? "0"}</p>;
    },
  },
  {
    accessorKey: "diwali_bonus",
    header: "Diwali Bonus",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.diwali_bonus ?? "0"}</p>;
    },
  },
  {
    accessorKey: "commission",
    header: "Commission",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.commission ?? "0"}</p>;
    },
  },
  {
    accessorKey: "joining_bonus",
    header: "Joining Bonus",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.joining_bonus ?? "0"}</p>;
    },
  },
  {
    accessorKey: "yearly_bonus",
    header: "Yearly Bonus",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.yearly_bonus ?? "0"}</p>;
    },
  },
  {
    accessorKey: "leave_encashment",
    header: "Leave Encashment",
    cell: ({ row }) => {
      return (
        <p className="truncate">{row.original?.leave_encashment ?? "0"}</p>
      );
    },
  },
  {
    accessorKey: "gift_coupon",
    header: "Gift Coupon",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.gift_coupon ?? "0"}</p>;
    },
  },
  {
    accessorKey: "computer_service_charges",
    header: "Computer Service Charges",
    cell: ({ row }) => {
      return (
        <p className="truncate">
          {row.original?.computer_service_charges ?? "0"}
        </p>
      );
    },
  },
  {
    accessorKey: "gratuity",
    header: "Gratuity",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.gratuity ?? "0"}</p>;
    },
  },
  {
    accessorKey: "deduction",
    header: "Deduction",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.deduction ?? "0"}</p>;
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      return <p className="capitalize truncate">{row.original?.note ?? "--"}</p>;
    },
  },
];
