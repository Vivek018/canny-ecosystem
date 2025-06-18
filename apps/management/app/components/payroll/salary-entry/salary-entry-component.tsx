import { Button } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { Outlet, useNavigation, useParams, useSubmit } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import React, { useState, useEffect } from "react";
import { useUser } from "@/utils/user";
import {
  approveRole,
  formatDate,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";

export function SalaryEntryComponent({
  data,
  payrollData,
  noButtons = false,
  env,
  fromWhere,
}: {
  data: SalaryEntriesWithEmployee[];
  payrollData: Omit<PayrollDatabaseRow, "created_at" | "updated_at">;
  noButtons?: boolean;
  env: SupabaseEnv;
  fromWhere: "runpayroll" | "payrollhistory";
}) {

  const payrollCardDetails = [
    { title: "Title", value: "title" },
    { title: "Status", value: "status" },
    { title: "No of Employees", value: "total_employees" },
    { title: "Pay Day", value: "created_at" },
  ];

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

  function calculateFieldTotalsWithNetPay(
    employees: SalaryEntriesWithEmployee[]
  ): Record<string, { amount: number; type: string } | number> {
    const fieldTotals: Record<string, { amount: number; type: string }> = {};
    let gross = 0;
    let statutoryContributions = 0;
    let deductions = 0;

    for (const employee of employees) {
      for (const entry of employee.salary_entries) {
        const amount = entry.amount ?? 0;
        const fieldName = entry.field_name;
        const fieldType = entry.type;

        if (!fieldTotals[fieldName]) {
          fieldTotals[fieldName] = { amount: 0, type: fieldType! };
        }
        fieldTotals[fieldName].amount += amount;

        if (fieldType === "earning") {
          gross += amount;
        } else if (fieldType === "statutory_contribution") {
          statutoryContributions += amount;
        } else if (fieldType === "deduction") {
          deductions += amount;
        }
      }
    }

    return {
      ...fieldTotals,
      GROSS: gross,
      DEDUCTION: statutoryContributions + deductions,
      TOTAL: gross - statutoryContributions - deductions,
    };
  }

  const totals = calculateFieldTotalsWithNetPay(data);

  const earningEntries = Object.entries(totals).filter(
    ([, value]: any) => value.type === "earning"
  );
  const earningCount = earningEntries.length;

  const deductiveEntries = Object.entries(totals).filter(
    ([, value]: any) =>
      value.type === "deduction" || value.type === "statutory_contribution"
  );
  const deductiveCount = deductiveEntries.length;

  return (
    <section className="p-4">
      <div className={cn("mb-5 grid grid-cols-2 gap-4")}>
        <Card className="flex flex-col justify-around px-4 py-2">
          <CardContent className="p-0 text-center">
            <div className="grid grid-cols-2 gap-x-4 text-sm">
              <div className="text-center text-lg">
                Earnings
                <hr />
                <div className="grid grid-cols-2 gap-x-4 text-sm text-left py-2">
                  {[
                    ...Object.entries(totals)
                      .filter(([, value]: any) => value.type === "earning")
                      .map(([key, value]: any) => (
                        <React.Fragment key={key}>
                          <p>{key}</p>
                          <p className="text-muted-foreground">
                            {value?.amount?.toString() || "0"}
                          </p>
                        </React.Fragment>
                      )),
                    ...Array(
                      deductiveCount - earningCount > 0
                        ? deductiveCount - earningCount
                        : 0
                    )
                      .fill(null)
                      .map((_, i) => (
                        <React.Fragment key={`empty-${i.toString()}`}>
                          <p>&nbsp;</p>
                          <p>&nbsp;</p>
                        </React.Fragment>
                      )),
                  ]}
                </div>
                <hr />
                <p className="text-sm py-1">
                  Gross : {totals.GROSS.toString()}
                </p>
              </div>
              <div className="text-center text-lg">
                Deductions
                <hr />
                <div className="grid grid-cols-2 gap-x-4 text-sm text-left py-2">
                  {[
                    Object.entries(totals).map(
                      ([key, value]: any) =>
                        (value.type === "deduction" ||
                          value.type === "statutory_contribution") && (
                          <React.Fragment key={key}>
                            <p>{key}</p>
                            <p className=" text-muted-foreground">
                              {value?.amount?.toString() || "0"}
                            </p>
                          </React.Fragment>
                        )
                    ),
                    ...Array(
                      earningCount - deductiveCount > 0
                        ? earningCount - deductiveCount
                        : 0
                    )
                      .fill(null)
                      .map((_, i) => (
                        <React.Fragment key={`empty-${i.toString()}`}>
                          <p>&nbsp;</p>
                          <p>&nbsp;</p>
                        </React.Fragment>
                      )),
                  ]}
                </div>
                <hr />
                <p className="text-sm py-1">
                  Deduction : {totals.DEDUCTION.toString()}
                </p>
              </div>
            </div>
            <hr />
            <p className="mt-2">Net Amount : {totals.TOTAL.toString()}</p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-2">
          {payrollCardDetails?.map((details, index) => (
            <Card
              key={index.toString()}
              className="flex flex-col justify-around"
            >
              <CardHeader className="p-0">
                <CardTitle className="text-lg text-center">
                  {details.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-0  px-2 text-muted-foreground text-center">
                <p
                  className={cn(
                    "text-wrap break-words whitespace-pre-wrap",
                    details.title === "Title" && "text-sm"
                  )}
                >
                  {details.value === "created_at"
                    ? formatDate(
                        payrollData[details.value as keyof typeof payrollData]
                      )
                    : payrollData[details.value as keyof typeof payrollData]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
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
          fromWhere={fromWhere}
          status={payrollData?.status}
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
