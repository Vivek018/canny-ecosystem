import { AdvancesTable } from "@/components/advances/table/advances-table";
import { AdvancesColumns } from "@/components/advances/table/columns";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";

const claims = [
  {
    claim_number: "CLM021",
    employee_name: "Ella Baker",
    submitted_date: "2024-12-05",
    status: "Pending",
    claim_amount: 2500.25,
    approved_amount: 0,
  },
  {
    claim_number: "CLM022",
    employee_name: "Henry Lewis",
    submitted_date: "2024-11-23",
    status: "Approved",
    claim_amount: 1800,
    approved_amount: 1800,
  },
  {
    claim_number: "CLM023",
    employee_name: "Zoe Carter",
    submitted_date: "2024-12-04",
    status: "Rejected",
    claim_amount: 600,
    approved_amount: 0,
  },
  {
    claim_number: "CLM024",
    employee_name: "Daniel Wright",
    submitted_date: "2024-11-26",
    status: "Pending",
    claim_amount: 320,
    approved_amount: 0,
  },
  {
    claim_number: "CLM025",
    employee_name: "Grace Hall",
    submitted_date: "2024-12-03",
    status: "Approved",
    claim_amount: 4200.5,
    approved_amount: 4200.5,
  },
];

export default function Advances() {
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
            to="advances-form"
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
      <AdvancesTable data={tableData as any} columns={AdvancesColumns} />
    </section>
  );
}
