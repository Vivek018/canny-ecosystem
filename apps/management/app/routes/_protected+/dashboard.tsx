import { DashboardFilter } from "@/components/dashboard/dashboard-filter";
import { FilterList } from "@/components/dashboard/filter-list";
import { CountCards } from "@/components/dashboard/count-cards";
import { ErrorBoundary } from "@/components/error-boundary";
import { PayrollTrend } from "@/components/payroll/analytics/payroll-trend";
import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  type DashboardFilters,
  getActiveEmployeesByCompanyId,
  getApprovedPayrollsAmountsByCompanyIdByMonths,
  getApprovedPayrollsByCompanyIdByYears,
  getExitsByCompanyIdByMonths,
  getInvoicesByCompanyIdForDashboard,
  getNotificationByCompanyId,
  type InvoiceDataType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import { type ClientLoaderFunctionArgs, useLoaderData } from "@remix-run/react";
import type {
  EmployeeDatabaseRow,
  ExitsRow,
  PayrollDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { ActiveEmployeesBySite } from "@/components/payroll/analytics/active-employees-by-site";
import { InvoicePaidUnpaid } from "@/components/dashboard/paid-unpaid-invoices";
import { useAnimateTextScroll } from "@canny_ecosystem/ui/animate-text-scroll";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const url = new URL(request.url);

  const searchParams = new URLSearchParams(url.searchParams);

  const filters: DashboardFilters = {
    month: searchParams.get("month") ?? undefined,
    year: searchParams.get("year") ?? undefined,
  };

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data: notificationData, error: notificationError } = await getNotificationByCompanyId({ supabase, companyId });

    const {
      currentMonthExits,
      currentMonthExitErrors,
      previousMonthExits,
      previousMonthExitErrors,
    } = await getExitsByCompanyIdByMonths({ companyId, supabase, filters });
    if (notificationError) throw notificationError;
    if (currentMonthExitErrors) throw currentMonthExitErrors;
    if (previousMonthExitErrors) throw previousMonthExitErrors;

    const {
      activeEmployeeError,
      activeEmployees,
      totalEmployeeError,
      totalEmployees,
      activeEmployeesBySites,
      activeEmployeeErrorBySites,
    } = await getActiveEmployeesByCompanyId({
      supabase,
      companyId,
    });

    if (activeEmployeeError) throw activeEmployeeError;
    if (totalEmployeeError) throw totalEmployeeError;
    if (activeEmployeeErrorBySites) throw activeEmployeeErrorBySites;

    const {
      currentMonth: currentPayrollData,
      currentMonthError: currentPayrollError,
      previousMonth: previousPayrollData,
      previousMonthError: previousPayrollError,
    } = await getApprovedPayrollsAmountsByCompanyIdByMonths({
      supabase,
      companyId,
      filters,
    });

    if (currentPayrollError) throw currentPayrollError;
    if (previousPayrollError) throw previousPayrollError;

    const { data: payrollDataByYears, error: payrollDataByYearError } =
      await getApprovedPayrollsByCompanyIdByYears({
        companyId,
        supabase,
        filters,
      });
    if (payrollDataByYearError) throw payrollDataByYearError;

    const { data: invoiceData, error: invoiceDataError } =
      await getInvoicesByCompanyIdForDashboard({
        companyId,
        supabase,
        filters,
      });
    if (invoiceDataError) throw invoiceDataError;

    return defer({
      notificationData,
      currentMonthExits,
      previousMonthExits,
      currentPayrollData,
      previousPayrollData,
      activeEmployees,
      totalEmployees,
      activeEmployeesBySites,
      payrollDataByYears,
      invoiceData,
      filters,
      error: null,
    });
  } catch (error) {
    return defer({
      notificationData: null,
      currentMonthExits: null,
      previousMonthExits: null,
      currentPayrollData: null,
      previousPayrollData: null,
      activeEmployees: null,
      totalEmployees: null,
      activeEmployeesBySites: null,
      payrollDataByYears: null,
      invoiceData: null,
      filters,
      error: error,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.dashboard}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export default function Dashboard() {
  const {
    notificationData,
    currentMonthExits,
    previousMonthExits,
    currentPayrollData,
    previousPayrollData,
    activeEmployees,
    totalEmployees,
    activeEmployeesBySites,
    payrollDataByYears,
    invoiceData,
    filters,
    error,
  } = useLoaderData<typeof loader>();

  const { containerRef, contentRef } = useAnimateTextScroll({
    pauseDurationMs: 5000,
    speed: 1.5,
  });

  if (error) {
    clearCacheEntry(cacheKeyPrefix.dashboard);
    return <ErrorBoundary error={error} message="Failed to load data" />;
  }

  return (
    <>
      <div ref={containerRef} className={cn("overflow-hidden w-full border-b bg-primary/15", !notificationData?.text && "hidden")}>
        <div ref={contentRef} className="text-primary whitespace-nowrap p-4">
          {notificationData?.text}
          <span aria-hidden className="inline-block w-[17px]" />
        </div>
      </div>
      <section className="w-full p-4 flex flex-col gap-4">
        <div className="flex justify-end">
          <div className="flex justify-between gap-3">
            <FilterList filters={filters as unknown as DashboardFilters} />
            <DashboardFilter />
          </div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <CountCards
            currentData={currentPayrollData as unknown as PayrollDatabaseRow[]}
            previousData={previousPayrollData as unknown as PayrollDatabaseRow[]}
            activeEmployeeCount={
              activeEmployees as unknown as EmployeeDatabaseRow[]
            }
            totalEmployeeCount={
              totalEmployees as unknown as EmployeeDatabaseRow[]
            }
            currentExits={currentMonthExits as unknown as ExitsRow[]}
            previousExits={previousMonthExits as unknown as ExitsRow[]}
          />
          <PayrollTrend chartData={payrollDataByYears} />
          <div className="grid grid-cols-3 gap-4">
            <ActiveEmployeesBySite
              chartData={
                activeEmployeesBySites as unknown as EmployeeDatabaseRow[]
              }
            />
            <InvoicePaidUnpaid
              chartData={invoiceData as unknown as InvoiceDataType[]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
