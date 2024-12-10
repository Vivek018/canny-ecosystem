export const ReimbursementsColumns = [
  {
    accessorKey: "claim_number",
    header: "Claim Number",
    cell: ({ row }) => {
      return (
        <p className="truncate font-semibold">{`${row.original?.claim_number ?? "--"}`}</p>
      );
    },
  },

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
    accessorKey: "submitted_date",
    header: "Submitted Date",
    cell: ({ row }) => {
      return <p className="truncate ">{row.original?.submitted_date ?? ""}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <p className="truncate capitalize ">{row.original?.status ?? "--"}</p>
      );
    },
  },
  {
    accessorKey: "claim_amount",
    header: "Claim Amount",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.claim_amount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "approved_amount",
    header: "Aprroved Amount",
    cell: ({ row }) => {
      return (
        <p className="truncate">{row.original?.approved_amount ?? "--"}</p>
      );
    },
  },
];
