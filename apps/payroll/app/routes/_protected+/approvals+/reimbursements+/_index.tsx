import { ReimbursementsColumns } from "@/components/reimbursements/table/columns";
import { ReimbursementsTable } from "@/components/reimbursements/table/reimbursements-table";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";

const claims = [
  {
    claim_number: "CLM001",
    employee_name: "John Doe",
    submitted_date: "2024-12-01",
    status: "Pending",
    claim_amount: 1500.5,
    approved_amount: 0,
  },
  {
    claim_number: "CLM002",
    employee_name: "Jane Smith",
    submitted_date: "2024-11-25",
    status: "Approved",
    claim_amount: 2300,
    approved_amount: 2300,
  },
  {
    claim_number: "CLM003",
    employee_name: "Samuel Green",
    submitted_date: "2024-11-20",
    status: "Rejected",
    claim_amount: 1200,
    approved_amount: 0,
  },
  {
    claim_number: "CLM004",
    employee_name: "Emily Brown",
    submitted_date: "2024-12-03",
    status: "Pending",
    claim_amount: 450.75,
    approved_amount: 0,
  },
  {
    claim_number: "CLM005",
    employee_name: "Michael Johnson",
    submitted_date: "2024-11-30",
    status: "Approved",
    claim_amount: 800,
    approved_amount: 800,
  },
  {
    claim_number: "CLM006",
    employee_name: "Olivia Davis",
    submitted_date: "2024-11-28",
    status: "Pending",
    claim_amount: 3000,
    approved_amount: 0,
  },
  {
    claim_number: "CLM007",
    employee_name: "Liam Wilson",
    submitted_date: "2024-11-27",
    status: "Rejected",
    claim_amount: 560,
    approved_amount: 0,
  },
  {
    claim_number: "CLM008",
    employee_name: "Sophia Martinez",
    submitted_date: "2024-12-02",
    status: "Approved",
    claim_amount: 1750,
    approved_amount: 1750,
  },
  {
    claim_number: "CLM009",
    employee_name: "Ethan Moore",
    submitted_date: "2024-12-04",
    status: "Pending",
    claim_amount: 620,
    approved_amount: 0,
  },
  {
    claim_number: "CLM010",
    employee_name: "Isabella Taylor",
    submitted_date: "2024-11-26",
    status: "Approved",
    claim_amount: 900,
    approved_amount: 900,
  },
  {
    claim_number: "CLM011",
    employee_name: "James Anderson",
    submitted_date: "2024-11-29",
    status: "Rejected",
    claim_amount: 1320,
    approved_amount: 0,
  },
  {
    claim_number: "CLM012",
    employee_name: "Charlotte Thomas",
    submitted_date: "2024-11-24",
    status: "Pending",
    claim_amount: 870.5,
    approved_amount: 0,
  },
  {
    claim_number: "CLM013",
    employee_name: "Benjamin Garcia",
    submitted_date: "2024-11-22",
    status: "Approved",
    claim_amount: 1450,
    approved_amount: 1450,
  },
  {
    claim_number: "CLM014",
    employee_name: "Ava Rodriguez",
    submitted_date: "2024-11-30",
    status: "Pending",
    claim_amount: 3200,
    approved_amount: 0,
  },
  {
    claim_number: "CLM015",
    employee_name: "Lucas Perez",
    submitted_date: "2024-12-01",
    status: "Rejected",
    claim_amount: 980,
    approved_amount: 0,
  },
  {
    claim_number: "CLM016",
    employee_name: "Mia Sanchez",
    submitted_date: "2024-12-03",
    status: "Approved",
    claim_amount: 2100,
    approved_amount: 2100,
  },
  {
    claim_number: "CLM017",
    employee_name: "Elijah Scott",
    submitted_date: "2024-11-25",
    status: "Pending",
    claim_amount: 640,
    approved_amount: 0,
  },
  {
    claim_number: "CLM018",
    employee_name: "Amelia Walker",
    submitted_date: "2024-11-28",
    status: "Approved",
    claim_amount: 1200.75,
    approved_amount: 1200.75,
  },
  {
    claim_number: "CLM019",
    employee_name: "Alexander White",
    submitted_date: "2024-12-02",
    status: "Rejected",
    claim_amount: 350,
    approved_amount: 0,
  },
  {
    claim_number: "CLM020",
    employee_name: "Harper Harris",
    submitted_date: "2024-11-21",
    status: "Approved",
    claim_amount: 5000,
    approved_amount: 5000,
  },
];

export default function Reimbursements() {
  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(claims);

  useEffect(() => {
    const filteredData = claims?.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchString.toLowerCase())
      )
    );
    setTableData(filteredData);
  }, [searchString, claims]);
  return (
    <section className="m-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="w-full  flex justify-between items-center">
          <div className="relative w-96">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icon
                name="magnifying-glass"
                size="sm"
                className="text-gray-400"
              />
            </div>
            <Input
              placeholder="Search Users"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="pl-8 h-10 w-full focus-visible:ring-0"
            />
          </div>
          <Link
            to="reimbursements-form"
            className={cn(
              buttonVariants({ variant: "primary-outline" }),
              "flex items-center gap-1"
            )}
          >
            <span>Add</span>
            <span className="hidden md:flex justify-end">Claim</span>
          </Link>
        </div>
      </div>
      <ReimbursementsTable
        data={tableData as any}
        columns={ReimbursementsColumns}
      />
    </section>
  );
}
