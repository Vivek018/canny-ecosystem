import { PayrollDataTable } from "@/components/payroll/table/data-table";
import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { payrollColumns } from "@/components/payroll/table/columns";
import { Outlet, useNavigation, useSubmit } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState, useEffect } from "react";
import { PayrollActions } from "./payroll-actions";
import type { PayrollEntriesDatabaseRow } from "@canny_ecosystem/supabase/types";

export function PayrollComponent({
  data,
  editable,
}: {
  data: Omit<PayrollEntriesDatabaseRow, "created_at" | "updated_at">[];
  editable: boolean;
}) {
  const navigation = useNavigation();
  const disable =
    navigation.state === "submitting" || navigation.state === "loading";

  // searching functionality
  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(data);
  useEffect(() => {
    const filteredData = data?.filter(
      (item: { [s: string]: unknown } | ArrayLike<unknown>) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchString.toLowerCase()),
        ),
    );
    setTableData(filteredData);
  }, [searchString, data]);

  // approve payroll
  const submit = useSubmit();
  const approvePayroll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    submit(
      {
        data: JSON.stringify({
          payrollId: data[0]?.payroll_id,
        }),
        returnTo: "/payroll/run-payroll",
      },
      {
        method: "POST",
        action: "/payroll/run-payroll/approve-payroll",
      },
    );
  };

  return (
    <section className="p-4">
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
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                className="pl-8 h-10 w-full focus-visible:ring-0"
              />
            </div>
            <PayrollActions payrollId={data[0].payroll_id} />
            <div className={cn(editable ? "" : "hidden")}>
              <Button onClick={(e) => approvePayroll(e)} disabled={disable}>
                Submit & Approve
              </Button>
            </div>
          </div>
        </div>
        <PayrollDataTable
          data={tableData ?? []}
          columns={payrollColumns}
          editable={editable}
        />
      </div>
      <Outlet />
    </section>
  );
}
