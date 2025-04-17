import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { Outlet, useNavigation, useParams, useSubmit } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState, useEffect } from "react";
import { useUser } from "@/utils/user";
import {
  approveRole,
  hasPermission,
  searchInObject,
  updateRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { SalaryEntriesWithEmployee } from "@canny_ecosystem/supabase/queries";
import type {
  PayrollDatabaseRow,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { PayrollActions } from "../payroll-actions";
import { SalaryEntryDataTable } from "./salary-entry-table/data-table";
import { salaryEntryColumns } from "./salary-entry-table/columns";

export function SalaryEntryComponent({
  data,
  payrollData,
  noButtons = false,
  env,
}: {
  data: SalaryEntriesWithEmployee[];
  payrollData: Omit<PayrollDatabaseRow, "created_at" | "updated_at">;
  noButtons?: boolean;
  env: SupabaseEnv;
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
    const filteredData = data?.filter((item) =>
      searchInObject(item, searchString)
    );

    setTableData(filteredData);
  }, [searchString, data]);

  const updateStatusPayroll = (
    e: React.MouseEvent<HTMLButtonElement>,
    status: PayrollDatabaseRow["status"]
  ) => {
    e.preventDefault();
    submit(
      {
        data: JSON.stringify({
          id: payrollId ?? payrollData?.id,
          status: status,
          total_employees: payrollData?.total_employees,
          total_net_amount: payrollData?.total_net_amount,
        }),
      },
      {
        method: "POST",
        action: `/payroll/run-payroll/${payrollId}`,
      }
    );
  };
  return (
    <section className="p-4">
      <div className="w-full flex items-center justify-between gap-4 pb-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="magnifying-glass" size="sm" className="text-gray-400" />
          </div>
          <Input
            placeholder="Search Salary Entries"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            className="pl-8 h-10 w-full focus-visible:ring-0 shadow-none"
          />
        </div>
        <div
          className={cn("ml-auto flex flex-row gap-3", noButtons && "hidden")}
        >
          <Button
            variant={payrollData.status === "approved" ? "muted" : "default"}
            onClick={(e) => updateStatusPayroll(e, "submitted")}
            className={cn(
              "hidden h-10",
              (payrollData.status === "pending" ||
                payrollData.status === "approved") &&
                hasPermission(role, `${updateRole}:${attribute.payroll}`) &&
                "flex"
            )}
            disabled={disable}
          >
            {payrollData.status === "pending" ? "Submit" : "Undo Approval"}
          </Button>
          <Button
            variant="muted"
            onClick={(e) => updateStatusPayroll(e, "pending")}
            className={cn(
              "hidden h-10",
              payrollData.status === "submitted" &&
                hasPermission(role, `${updateRole}:${attribute.payroll}`) &&
                "flex"
            )}
            disabled={disable}
          >
            Undo Submit
          </Button>
          <Button
            onClick={(e) => updateStatusPayroll(e, "approved")}
            className={cn(
              "hidden h-10",
              payrollData.status === "submitted" &&
                hasPermission(role, `${approveRole}:${attribute.payroll}`) &&
                "flex"
            )}
            disabled={disable}
          >
            Approve
          </Button>
        </div>
        <PayrollActions
          className={cn(payrollData?.status === "pending" && "hidden")}
          payrollId={payrollId ?? payrollData?.id}
          data={data as unknown as any}
          env={env as SupabaseEnv}
          payrollData={payrollData}
        />
      </div>

      <SalaryEntryDataTable
        data={tableData}
        columns={salaryEntryColumns({
          data,
          editable: payrollData?.status === "pending",
        })}
      />
      <Outlet />
    </section>
  );
}
