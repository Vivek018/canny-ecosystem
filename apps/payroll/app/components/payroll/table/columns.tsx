// @ts-nocheck
export const payrollColumns = [
  {
    accessorKey: "name",
    header: "Employee Name",
    cell: ({ row }) => {
      return <p className="truncate capitalize w-28">{`${row.original?.name ?? "--"}`}</p>;
    }
  },
  {
    accessorKey: "employee_code",
    header: "Employee Code",
    cell: ({ row }) => {
      return <p className="truncate capitalize w-48">{`${row.original?.employee_code ?? "--"}`}</p>;
    }
  },
  {
    accessorKey: "present_days",
    header: "Present Days",
    cell: ({ row }) => {
      return <p className="truncate capitalize w-48">{`${row.original?.present_days ?? "--"}`}</p>;
    }
  },
  {
    accessorKey: "designation",
    header: "Designation",
    cell: ({ row }) => {
      return <p className="truncate capitalize w-48">{`${row.original?.designation ?? "--"}`}</p>;
    }
  },
  {
    accessorKey: "gross_pay",
    header: "Gross Pay",
    cell: ({ row }) => {
      return <p className="truncate capitalize w-48">{`${row.original?.gross_pay ?? "--"}`}</p>;
    }
  },
  {
    accessorKey: "deductions",
    header: "Deductions",
    cell: ({ row }) => {
      return <p className="truncate capitalize w-48">{`${row.original?.deductions ?? "--"}`}</p>;
    }
  },
  {
    accessorKey: "net_pay",
    header: "Net Pay",
    cell: ({ row }) => {
      return <p className="truncate capitalize w-48">{`${row.original?.net_pay ?? "--"}`}</p>;
    }
  }
];