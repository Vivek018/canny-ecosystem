import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import {
  Outlet,
  useNavigation,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import React, { useState, useEffect } from "react";
import { useUser } from "@/utils/user";
import {
  approveRole,
  formatDate,
  getMonthName,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { Label } from "@canny_ecosystem/ui/label";
import { ImportGroupPayrollDialog } from "../import-grouped-payroll-dialog";
import { useSalaryEntriesStore } from "@/store/salary-entries";
import { MultiSelectCombobox } from "@canny_ecosystem/ui/multi-select-combobox";

export function SalaryEntryComponent({
  data,
  payrollData,
  noButtons = false,
  env,
  fromWhere,
  groupOptions,
  siteOptions,
}: {
  data: SalaryEntriesWithEmployee[];
  payrollData: Omit<PayrollDatabaseRow, "created_at" | "updated_at">;
  noButtons?: boolean;
  env: SupabaseEnv;
  fromWhere: "runpayroll" | "payrollhistory";
  siteOptions: any[];
  groupOptions: any[];
}) {
  const { selectedRows } = useSalaryEntriesStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [title, setTitle] = useState(payrollData?.title);
  const [rundate, setRundate] = useState(payrollData?.run_date);

  const payrollCardDetails = [
    { title: "Status", value: "status" },
    { title: `${getMonthName(payrollData.month!)}`, value: "year" },
    { title: "No of Employees", value: "total_employees" },
  ];
  const { role } = useUser();
  const { payrollId } = useParams();
  const submit = useSubmit();

  const navigation = useNavigation();
  const disable =
    navigation.state === "submitting" || navigation.state === "loading";

  const [site, setSite] = useState<string[]>(
    () =>
      searchParams.get("site")?.split(",") ?? []
  );
  const [group, setGroup] = useState<string[]>(
    () =>
      searchParams.get("group")?.split(",") ?? []
  );

  const handleFieldChange = (newSelectedFields: string[]) => {
    payrollData.project_id
      ? setSite(newSelectedFields)
      : setGroup(newSelectedFields);
  };

  const handleRenderSelectedItem = (values: string[]): string => {
    if (values.length === 0) return "";

    if (values.length <= 3) {
      return payrollData.project_id
        ? siteOptions
            .filter((option) => values.includes(String(option.value)))
            .map((option) => option.label)
            .join(", ")
        : groupOptions
            .filter((option) => values.includes(String(option.value)))
            .map((option) => option.label)
            .join(", ");
    }

    return `${values.length} selected`;
  };

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (payrollData.project_id) {
      if (site.length) {
        newParams.set("site", site.join(","));
      } else {
        newParams.delete("site");
      }
    }

    if (payrollData.project_site_id) {
      if (group.length) {
        newParams.set("group", group.join(","));
      } else {
        newParams.delete("group");
      }
    }

    setSearchParams(newParams);
  }, [site, group]);

  const [searchString, setSearchString] = useState("");
  const [tableData, setTableData] = useState(
    selectedRows.length ? selectedRows : data
  );

  useEffect(() => {
    const filteredData = data?.filter((item) =>
      searchInObject(item, searchString)
    );

    setTableData(filteredData as any);
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
    employees: any
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

  const totals = calculateFieldTotalsWithNetPay(
    selectedRows.length ? selectedRows : data
  );

  const earningEntries = Object.entries(totals).filter(
    ([, value]: any) => value.type === "earning"
  );
  const earningCount = earningEntries.length;

  const deductiveEntries = Object.entries(totals).filter(
    ([, value]: any) =>
      value.type === "deduction" || value.type === "statutory_contribution"
  );
  const deductiveCount = deductiveEntries.length;

  const handleUpdatePayroll = () => {
    submit(
      {
        payrollId: payrollId ?? payrollData?.id,
        payrollData: JSON.stringify({ title: title, run_date: rundate }),
        failedRedirect:
          fromWhere === "runpayroll"
            ? `/payroll/run-payroll/${payrollId}`
            : `/payroll/payroll-history/${payrollId}`,
      },
      {
        method: "POST",
        action: "/payroll/run-payroll/update-payroll",
      }
    );
  };

  return (
    <section className="p-4">
      <div className={cn("mb-5 grid grid-cols-2 gap-4")}>
        <Card
          className={cn(
            "flex flex-col justify-around px-4 py-2",
            selectedRows.length && "bg-muted"
          )}
        >
          <CardContent className="p-0 text-center">
            <div className="grid grid-cols-2 gap-x-4 text-sm">
              <div className="text-center text-lg">
                Earnings
                <hr
                  className={cn(
                    selectedRows.length && "border-muted-foreground"
                  )}
                />
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
                <hr
                  className={cn(
                    selectedRows.length && "border-muted-foreground"
                  )}
                />
                <p className="text-sm py-1">
                  Gross : {totals.GROSS.toString()}
                </p>
              </div>
              <div className="text-center text-lg">
                Deductions
                <hr
                  className={cn(
                    selectedRows.length && "border-muted-foreground"
                  )}
                />
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
                <hr
                  className={cn(
                    selectedRows.length && "border-muted-foreground"
                  )}
                />
                <p className="text-sm py-1">
                  Deduction : {totals.DEDUCTION.toString()}
                </p>
              </div>
            </div>
            <hr
              className={cn(selectedRows.length && "border-muted-foreground")}
            />
            <p className="mt-2">Net Amount : {totals.TOTAL.toString()}</p>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-2">
          <div className="relative h-full">
            <Card className="h-full flex flex-col justify-between px-4 py-3">
              <div className="absolute top-2 right-2 z-10">
                <AlertDialog>
                  <AlertDialogTrigger
                    className={cn(" bg-secondary rounded-md px-1 pb-1")}
                  >
                    <Icon className="text-md" name="edit" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Update Payroll</AlertDialogTitle>
                      <AlertDialogDescription>
                        Update the payroll here
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Title</Label>
                        <Input
                          type="text"
                          placeholder="Enter the Title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Run Date</Label>
                        <Input
                          type="date"
                          value={rundate!}
                          placeholder="Enter the Date"
                          onChange={(e) => setRundate(e.target.value)}
                        />
                      </div>
                    </div>
                    <AlertDialogFooter className="pt-2">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className={cn(buttonVariants({ variant: "default" }))}
                        onClick={handleUpdatePayroll}
                        onSelect={handleUpdatePayroll}
                      >
                        Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <CardContent className="h-full p-0">
                <div className="h-full grid grid-cols-2 gap-4">
                  <div className="flex flex-col justify-around items-center">
                    <span className="">Title</span>
                    <span className="text-base font-medium text-muted-foreground break-words">
                      {payrollData?.title}
                    </span>
                  </div>
                  <div className="flex flex-col justify-around items-center">
                    <span className="">Run Date</span>
                    <span className="text-base font-medium text-muted-foreground break-words">
                      {formatDate(payrollData?.run_date)?.toString() ?? ""}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="h-full grid grid-cols-3 gap-2">
            {payrollCardDetails?.map((details, index) => (
              <Card
                key={index.toString()}
                className="flex flex-col justify-around pb-1"
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
                    <>
                      {payrollData[details.value as keyof typeof payrollData]}
                    </>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-between gap-4 pb-4">
        <div className="w-1/3">
          <MultiSelectCombobox
            label="Groups"
            options={payrollData?.project_id ? siteOptions : groupOptions}
            value={payrollData?.project_id ? site : group}
            onChange={handleFieldChange}
            renderItem={(option) =>
              payrollData?.project_id ? (
                <div
                  role="option"
                  aria-selected={site.includes(String(option.value))}
                >
                  {option.label}
                </div>
              ) : (
                <div
                  role="option"
                  aria-selected={group.includes(String(option.value))}
                >
                  {option.label}
                </div>
              )
            }
            renderSelectedItem={handleRenderSelectedItem}
            aria-label="Filter by payment field"
            aria-required="false"
            aria-multiselectable="true"
            aria-describedby="payment-field-description"
          />
          <span id="payment-field-description" className="sr-only">
            Select one or more payment fields. Shows individual payment fields
            names when 3 or fewer are selected.
          </span>
        </div>
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
        <div className={cn(fromWhere === "payrollhistory" && "hidden")}>
          <ImportGroupPayrollDialog />
        </div>
        <PayrollActions
          className={cn(
            payrollData?.status === "pending" || !selectedRows.length
              ? "hidden"
              : ""
          )}
          payrollId={payrollId ?? payrollData?.id}
          data={selectedRows.length ? selectedRows : (data as unknown as any)}
          env={env as SupabaseEnv}
          payrollData={payrollData}
          fromWhere={fromWhere}
          status={payrollData?.status}
        />
      </div>

      <SalaryEntryDataTable
        data={tableData as any}
        columns={salaryEntryColumns({
          data,
          editable: payrollData?.status === "pending",
        })}
        totalNet={totals.TOTAL as number}
      />
      <Outlet />
    </section>
  );
}
