import type React from "react";
import { useMemo, useCallback } from "react";
import { Button } from "@canny_ecosystem/ui/button";
import { Outlet, useNavigation, useParams, useSubmit } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useUser } from "@/utils/user";
import {
  approveRole,
  calculateFieldTotalsWithNetPay,
  getUniqueFields,
  hasPermission,
  updateRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type {
  EmployeeProvidentFundDatabaseRow,
  PayrollDatabaseRow,
  PayrollFieldsDatabaseRow,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { PayrollActions } from "../payroll-actions";
import { SalaryEntryDataTable } from "./salary-entry-table/data-table";
import { salaryEntryColumns } from "./salary-entry-table/columns";
import { ImportDepartmentPayrollDialog } from "../import-department-payroll-dialog";
import { useSalaryEntriesStore } from "@/store/salary-entries";
import { clearCacheEntry } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useSalaryData } from "@/utils/hooks/salary-data";
import { PayrollSummaryCard } from "./payroll-summary-card";
import { PayrollDetailsCard } from "./payroll-details-card";
import { FilterControls } from "./filter-controls";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";

export function SalaryEntryComponent({
  data,
  payrollData,
  noButtons = false,
  env,
  fromWhere,
  allSiteOptions,
  allLocationOptions,
  payrollFields,
  allEmployeeOptions,
  allProjectOptions,
  epfData,
}: {
  data: any[];
  payrollData: Omit<PayrollDatabaseRow, "created_at"> & {
    site?: { name: string } | null;
    project?: { name: string } | null;
  };
  noButtons?: boolean;
  env: SupabaseEnv;
  fromWhere: "runpayroll" | "payrollhistory";
  allSiteOptions: ComboboxSelectOption[];
  allProjectOptions: ComboboxSelectOption[];
  allLocationOptions: ComboboxSelectOption[];
  payrollFields?: PayrollFieldsDatabaseRow[];
  allEmployeeOptions?: ComboboxSelectOption[];
  epfData: EmployeeProvidentFundDatabaseRow;
}) {
  const { selectedRows } = useSalaryEntriesStore();
  const { role } = useUser();
  const { payrollId } = useParams();
  const submit = useSubmit();
  const navigation = useNavigation();

  const disable =
    navigation.state === "submitting" || navigation.state === "loading";

  const {
    siteOptions,
    departmentOptions,
    filteredData,
    searchString,
    setSearchString,
    selectedSiteIds,
    selectedDeptIds,
    handleFieldChange,
  } = useSalaryData(data);

  // Memoize calculations
  const totals = useMemo(
    () =>
      calculateFieldTotalsWithNetPay(selectedRows.length ? selectedRows : data),
    [selectedRows, data]
  );

  const uniqueFields = useMemo(
    () => getUniqueFields(filteredData),
    [filteredData]
  );

  const updateStatusPayroll = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement>,
      status: PayrollDatabaseRow["status"]
    ) => {
      e.preventDefault();
      clearCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
      submit(
        {
          data: JSON.stringify({
            id: payrollId ?? payrollData?.id,
            status: status,
          }),
          redirectUrl: `/payroll/run-payroll/${payrollId}`,
        },
        {
          method: "POST",
          action: `/payroll/run-payroll/${payrollId}`,
        }
      );
    },
    [payrollId, payrollData, submit]
  );

  const handleUpdatePayroll = useCallback(
    (title: string, rundate: string, link: string, linked: string) => {
      clearCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);

      const payload: Record<string, any> = {
        title,
        run_date: rundate,
      };

      if (link === "site") {
        payload.site_id = linked;
        payload.project_id = null;
      } else if (link === "project") {
        payload.project_id = linked;
        payload.site_id = null;
      } else if (link === "unlink") {
        payload.project_id = null;
        payload.site_id = null;
      }

      submit(
        {
          payrollId: payrollId ?? payrollData?.id,
          payrollData: JSON.stringify(payload),
          failedRedirect: `/payroll/run-payroll/${payrollId}`,
        },
        {
          method: "POST",
          action: "/payroll/run-payroll/update-payroll",
        }
      );
    },
    [payrollId, payrollData?.id, submit]
  );

  const showSubmitButton = useMemo(
    () =>
      (payrollData.status === "pending" || payrollData.status === "approved") &&
      hasPermission(role, `${updateRole}:${attribute.payroll}`),
    [payrollData.status, role]
  );

  const showUndoSubmitButton = useMemo(
    () =>
      payrollData.status === "submitted" &&
      hasPermission(role, `${updateRole}:${attribute.payroll}`),
    [payrollData.status, role]
  );

  const showApproveButton = useMemo(
    () =>
      payrollData.status === "submitted" &&
      hasPermission(role, `${approveRole}:${attribute.payroll}`),
    [payrollData.status, role]
  );

  return (
    <section className="px-4 flex flex-col max-h-full gap-4 overflow-hidden">
      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <PayrollSummaryCard
          totals={totals}
          hasSelectedRows={selectedRows.length > 0}
        />
        <PayrollDetailsCard
          payrollData={payrollData}
          onUpdatePayroll={handleUpdatePayroll}
          allProjectOptions={allProjectOptions}
          allSiteOptions={allSiteOptions}
        />
      </div>

      <div className="w-full flex flex-col md:flex-row items-start gap-3">
        <div className="w-full flex flex-row gap-3 overflow-x-auto">
          <FilterControls
            searchString={searchString}
            onSearchChange={setSearchString}
            siteOptions={siteOptions}
            departmentOptions={departmentOptions}
            selectedSiteIds={selectedSiteIds}
            selectedDeptIds={selectedDeptIds}
            onFieldChange={handleFieldChange}
            payrollData={payrollData}
          />
          <div
            className={cn(
              "ml-auto flex flex-row max-sm:justify-end gap-3 max-sm:gap-2",
              noButtons && "hidden"
            )}
          >
            <Button
              variant={payrollData.status === "approved" ? "muted" : "default"}
              onClick={(e) => updateStatusPayroll(e, "submitted")}
              className={cn("hidden h-10", showSubmitButton && "flex")}
              disabled={disable}
            >
              {payrollData.status === "pending" ? "Submit" : "Undo Approval"}
            </Button>

            <Button
              variant="muted"
              onClick={(e) => updateStatusPayroll(e, "pending")}
              className={cn("hidden h-10", showUndoSubmitButton && "flex")}
              disabled={disable}
            >
              Undo Submit
            </Button>

            <Button
              onClick={(e) => updateStatusPayroll(e, "approved")}
              className={cn("hidden h-10", showApproveButton && "flex")}
              disabled={disable}
            >
              Approve
            </Button>
          </div>
        </div>
        <div className="flex flex-row gap-3 max-sm:justify-end max-sm:w-full max-md:justify-end max-md:w-full">
          <div className={cn(fromWhere === "payrollhistory" && "hidden")}>
            <ImportDepartmentPayrollDialog
              payrollFields={payrollFields!}
              payrollId={payrollId!}
              allSiteOptions={allSiteOptions}
              allEmployeeOptions={allEmployeeOptions!}
            />
          </div>
          <PayrollActions
            className={cn(
              payrollData?.status === "pending" || !selectedRows.length
                ? "hidden"
                : ""
            )}
            epfData={epfData}
            payrollData={payrollData}
            allLocationOptions={allLocationOptions}
            payrollId={payrollId ?? payrollData?.id}
            data={selectedRows.length ? selectedRows : (data as any)}
            env={env}
            fromWhere={fromWhere}
            status={payrollData?.status}
          />
        </div>
      </div>

      {disable ? (
        <LoadingSpinner className="my-20" />
      ) : (
        <SalaryEntryDataTable
          data={filteredData}
          columns={salaryEntryColumns({
            uniqueFields,
            data,
            editable: payrollData?.status === "pending",
          })}
          totalNet={totals.TOTAL as number}
          uniqueFields={uniqueFields}
        />
      )}

      <Outlet />
    </section>
  );
}
