import { useMemo } from "react";
import { Outlet, useNavigation, useParams } from "@remix-run/react";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  calculateFieldTotalsWithNetPay,
  getUniqueFields,
} from "@canny_ecosystem/utils";
import type {
  PayrollDatabaseRow,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { PayrollActions } from "../payroll-actions";
import { SalaryEntryDataTable } from "./salary-entry-table/data-table";
import { salaryEntryColumns } from "./salary-entry-table/columns";
import { useSalaryEntriesStore } from "@/store/salary-entries";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PayrollSummaryCard } from "./payroll-summary-card";
import { PayrollDetailsCard } from "./payroll-details-card";
import { FilterControls } from "./filter-controls";
import type { ComboboxSelectOption } from "@canny_ecosystem/ui/combobox";
import { useSalaryData } from "@/hooks/salary-data";

export function SalaryEntryComponent({
  data,
  payrollData,
  env,
  fromWhere,
  allSiteOptions,
  allDepartmentOptions,
  allLocationOptions,
}: {
  data: any[];
  payrollData: Omit<PayrollDatabaseRow, "created_at"> & {
    site?: { name: string } | null;
    project?: { name: string } | null;
  };
  env: SupabaseEnv;
  fromWhere: "runpayroll" | "payrollhistory";
  allSiteOptions: ComboboxSelectOption[];
  allDepartmentOptions: ComboboxSelectOption[];
  allLocationOptions: ComboboxSelectOption[];
}) {
  const { selectedRows } = useSalaryEntriesStore();
  const { payrollId } = useParams();
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
    [selectedRows, data],
  );

  const uniqueFields = useMemo(
    () => getUniqueFields(filteredData),
    [filteredData],
  );

  return (
    <section className="p-2 md:p-4 flex flex-col max-h-full gap-4 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PayrollSummaryCard
          totals={totals}
          hasSelectedRows={selectedRows.length > 0}
        />
        <PayrollDetailsCard payrollData={payrollData} />
      </div>

      <div className="w-full flex flex-col md:flex-row items-start gap-3">
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
