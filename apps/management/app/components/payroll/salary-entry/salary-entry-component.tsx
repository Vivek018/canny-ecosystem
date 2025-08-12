import type React from "react";
import { useMemo, useCallback, useState } from "react";
import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
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
import {
  Combobox,
  type ComboboxSelectOption,
} from "@canny_ecosystem/ui/combobox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@canny_ecosystem/ui/alert-dialog";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Label } from "@canny_ecosystem/ui/label";

export function SalaryEntryComponent({
  data,
  payrollData,
  noButtons = false,
  env,
  fromWhere,
  allSiteOptions,
  allDepartmentOptions,
  allLocationOptions,
  payrollFields,
  allEmployeeOptions,
  allProjectOptions,
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
  allDepartmentOptions: ComboboxSelectOption[];
  allLocationOptions: ComboboxSelectOption[];
  payrollFields?: PayrollFieldsDatabaseRow[];
  allEmployeeOptions?: ComboboxSelectOption[];
}) {
  const { selectedRows } = useSalaryEntriesStore();
  const { role } = useUser();
  const { payrollId } = useParams();
  const submit = useSubmit();
  const navigation = useNavigation();

  const [sites, setSites] = useState("");
  const [departments, setDepartments] = useState("");

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
    [selectedRows, data],
  );

  const uniqueFields = useMemo(
    () => getUniqueFields(filteredData),
    [filteredData],
  );

  const updateStatusPayroll = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement>,
      status: PayrollDatabaseRow["status"],
    ) => {
      e.preventDefault();
      clearCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
      submit(
        {
          data: JSON.stringify({
            id: payrollId ?? payrollData?.id,
            status: status,
            total_employees: payrollData?.total_employees,
            total_net_amount: payrollData?.total_net_amount,
          }),
          redirectUrl: `/payroll/run-payroll/${payrollId}`,
        },
        {
          method: "POST",
          action: `/payroll/run-payroll/${payrollId}`,
        },
      );
    },
    [payrollId, payrollData, submit],
  );

  const handleUpdateBulkSalaryEntry = () => {
    const updates = selectedRows.map((entry: any) => {
      return {
        id: entry.salary_entries.id,
        site_id: sites && sites.trim() !== "" ? sites : null,
        department_id:
          departments && departments.trim() !== "" ? departments : null,
      };
    });

    clearCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
    submit(
      {
        payrollId: payrollId ?? payrollData?.id,
        salaryEntryData: JSON.stringify(updates),
        failedRedirect: `/payroll/run-payroll/${payrollId}`,
      },
      {
        method: "POST",
        action: `/payroll/run-payroll/${payrollId}/update-bulk-salary-entries`,
      },
    );
  };

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
        },
      );
    },
    [payrollId, payrollData?.id, submit],
  );

  const showSubmitButton = useMemo(
    () =>
      (payrollData.status === "pending" || payrollData.status === "approved") &&
      hasPermission(role, `${updateRole}:${attribute.payroll}`),
    [payrollData.status, role],
  );

  const showUndoSubmitButton = useMemo(
    () =>
      payrollData.status === "submitted" &&
      hasPermission(role, `${updateRole}:${attribute.payroll}`),
    [payrollData.status, role],
  );

  const showApproveButton = useMemo(
    () =>
      payrollData.status === "submitted" &&
      hasPermission(role, `${approveRole}:${attribute.payroll}`),
    [payrollData.status, role],
  );

  return (
    <section className="p-4 flex flex-col max-h-full gap-4 overflow-hidden">
      <div className="grid grid-cols-2 gap-4">
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

      <div className="w-full flex items-start gap-3">
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
          className={cn("ml-auto flex flex-row gap-3", noButtons && "hidden")}
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
              : "",
          )}
          allLocationOptions={allLocationOptions}
          payrollId={payrollId ?? payrollData?.id}
          data={selectedRows.length ? selectedRows : (data as any)}
          env={env}
          fromWhere={fromWhere}
          status={payrollData?.status}
        />
        <div
          className={cn(
            "border border-dotted border-muted-foreground h-full",
            (payrollData?.status === "approved" || !selectedRows.length) &&
              "hidden",
          )}
        />
        <AlertDialog>
          <AlertDialogTrigger
            className={cn(
              (payrollData?.status === "approved" || !selectedRows.length) &&
                "hidden",
            )}
          >
            <Button
              variant={"muted"}
              size={"icon"}
              className="w-10 h-10 border border-input"
            >
              <Icon name="edit" className="h-[18px] w-[18px]" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update Bulk Salary Entry</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Site</Label>
                <Combobox
                  options={allSiteOptions}
                  value={sites}
                  onChange={(e) => setSites(e)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Department</Label>
                <Combobox
                  options={allDepartmentOptions}
                  value={departments}
                  onChange={(e) => setDepartments(e)}
                />
              </div>
            </div>
            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={cn(buttonVariants({ variant: "default" }))}
                onClick={handleUpdateBulkSalaryEntry}
              >
                Update
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
            allSiteOptions,
            allDepartmentOptions,
          })}
          totalNet={totals.TOTAL as number}
          uniqueFields={uniqueFields}
        />
      )}

      <Outlet />
    </section>
  );
}
