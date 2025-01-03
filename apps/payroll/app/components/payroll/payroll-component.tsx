import { PayrollDataTable } from "@/components/payroll/table/data-table";
import { Button } from "@canny_ecosystem/ui/button";

import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { payrollColumns } from "@/components/payroll/table/columns";

import { InfoCard } from "./info-card";

export function PayrollComponent({ data, demo, heading, netDiff }: any) {
  return (
    <section className="m-4">
      <div className="flex justify-between items-center p-2">
        <div>
          Please check the data below. If data is correst aprrove and make
          payment to employees.
        </div>
        <div>
          <Button>Submit & Approve</Button>
        </div>
      </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 my-4">
        <InfoCard
          heading={heading.payroll_cost}
          value={demo.payroll_cost}
          netDiff={netDiff.payroll_cost}
        />
        <InfoCard
          heading={heading.employeess_net_pay}
          value={demo.employeess_net_pay}
          netDiff={netDiff.employeess_net_pay}
        />
        <InfoCard
          heading={heading.pending_payments}
          value={demo.pending_payments}
          netDiff={netDiff.pending_payments}
        />
        <InfoCard
          heading={heading.employees}
          value={demo.employees}
          netDiff={netDiff.employees}
          isPercentage={false}
        />
      </div>
      <div className="py-4">
        <div className="w-full flex items-center justify-between pb-4">
          <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Icon
                  name="magnifying-glass"
                  size="sm"
                  className="text-gray-400"
                />
              </div>
              <Input
                placeholder="Search Users"
                // value={searchString}
                // onChange={(e) => setSearchString(e.target.value)}
                className="pl-8 h-10 w-full focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
        <PayrollDataTable data={data as any} columns={payrollColumns} />
      </div>
    </section>
  );
}
