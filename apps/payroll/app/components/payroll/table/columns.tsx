

export const payrollColumns = [
  {
    accessorKey: "name",
    header: "Employee Name",
    cell: ({ row }) => {
      return <p className="truncate capitalize w-48">{`${row.original?.name ??"--"}`}</p>;
    }},

  {
    accessorKey: "paid_days",
    header: "Paid Days",
    cell: ({ row }) => {
      return <p className="truncate">{`${row.original?.paid_days ??"--"}`}</p>;
    },
    
  },
  {
    accessorKey: "gross_pay",
    header: "Gross Pay",
    cell: ({ row }) => {
      return (
        <p className="truncate  capitalize">
          {row.original?.gross_pay ?? ""}
        </p>
      );
    },
  },
  {
    accessorKey: "taxes",
    header: "Taxes",
    cell: ({ row }) => {
      return (
        <p className="truncate ">
          {row.original?.taxes ?? "--"}
        </p>
      );
    },
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.discount ?? "--"}</p>;
    },
  },
  {
    accessorKey: "bonus",
    header: "Bonus",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.bonus ??"--"}</p>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.email??"--"}</p>;
    },
  },
  {
    accessorKey: "mobile_number",
    header: "Mobile Number",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.mobile_number??"--"}</p>;
    },
  },
  {
    accessorKey: "reimbursements",
    header: "Reimbursements",
    cell: ({ row }) => {
      return <p className="truncate">{row.original?.reimbursements ??"--"}</p>;
    },
  },
  {
    accessorKey: "net_pay",
    header: "Net Pay",
    cell: ({ row }) => {
      return <p className=" truncate">{row.original?.net_pay??"--"}</p>;
    },
  },
  {
    accessorKey: "company_name",
    header: "Company Name",
    cell: ({ row }) => {
      return <p className="capitalize truncate">{row.original?.company_name ??"--"}</p>;
    },
  },
  {
    accessorKey: "site_name",
    header: "Site Name",
    cell: ({ row }) => {
      return <p className="capitalize truncate">{row.original?.site_name??"--"}</p>;
    },
  },
  {
    accessorKey: "area",
    header: "Area",
    cell: ({ row }) => {
      return <p className="capitalize truncate">{row.original?.area??"--"}</p>;
    },
  },
];
