import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import {
  Outlet,
  useNavigation,
  useParams,
  useSubmit,
} from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState, useEffect } from "react";
import { PayrollActions } from "./payroll-actions";
import type { PayrollEntriesWithEmployee } from "@canny_ecosystem/supabase/queries";
import type { PayrollDatabaseRow } from "@canny_ecosystem/supabase/types";
import { useUser } from "@/utils/user";
import {
  approveRole,
  hasPermission,
  searchInObject,
  updateRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { ReimbursementPayrollDataTable } from "./reimbursement-table/data-table";
import { payrollColumns } from "./reimbursement-table/columns";

export function PayrollComponent({
  data,
  payrollData,
}: {
  data: PayrollEntriesWithEmployee[];
  payrollData: Omit<PayrollDatabaseRow, "created_at" | "updated_at">;
}) {
  const { role } = useUser();
  const { payrollId } = useParams();
  const submit = useSubmit();


  const navigation = useNavigation();
  const disable =
    navigation.state === "submitting" || navigation.state === "loading";

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(data);

  useEffect(() => {
    const filteredData = data?.filter((item: any) =>
      searchInObject(item, searchString),
    );

    setTableData(filteredData);
  }, [searchString, data]);

  const submitPayroll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submit(
      {
        data: JSON.stringify({
          id: payrollId ?? payrollData?.id,
          status: "submitted",
          total_employees: payrollData?.total_employees,
          total_net_amount: payrollData?.total_net_amount,
        }),
      },
      {
        method: "POST",
        action: `/payroll/run-payroll/${payrollId}`,
      },
    );
  };

  const approvePayroll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submit(
      {
        data: JSON.stringify({
          id: payrollId ?? payrollData?.id,
          status: "approved",
          total_employees: payrollData?.total_employees,
          total_net_amount: payrollData?.total_net_amount,
        }),
      },
      {
        method: "POST",
        action: `/payroll/run-payroll/${payrollId}`,
      },
    );
  };

  return (
    <section className="p-4">
      <div className="w-full flex items-center justify-between gap-4 pb-4">
        <div className="relative w-full lg:w-3/5 2xl:w-1/3">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="magnifying-glass" size="sm" className="text-gray-400" />
          </div>
          <Input
            placeholder="Search Payroll Entries"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            className="pl-8 h-10 w-full focus-visible:ring-0 shadow-none"
          />
        </div>
        <div className="ml-auto flex flex-row gap-3">
          <div className={cn(payrollData?.status !== "pending" && "hidden")}>
            <Button
              onClick={(e) => submitPayroll(e)}
              className={cn(
                "hidden h-10",
                payrollData.status === "pending" &&
                  hasPermission(role, `${updateRole}:${attribute.payroll}`) &&
                  "flex",
              )}
              disabled={disable}
            >
              Submit
            </Button>
            <Button
              onClick={(e) => approvePayroll(e)}
              className={cn(
                "hidden h-10",
                payrollData.status === "submitted" &&
                  hasPermission(role, `${approveRole}:${attribute.payroll}`) &&
                  "flex",
              )}
              disabled={disable}
            >
              Approve
            </Button>
          </div>
          <PayrollActions
            className={cn(payrollData?.status === "pending" && "hidden")}
            payrollId={payrollId ?? payrollData?.id}
          />
        </div>
      </div>
      {payrollData?.payroll_type === "reimbursement" && (
        <ReimbursementPayrollDataTable
          data={tableData}
          columns={payrollColumns}
          editable={payrollData?.status === "pending"}
        />
      )}
      <Outlet />
    </section>
  );
}
