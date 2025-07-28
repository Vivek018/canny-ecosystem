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
  getPaidInvoicesAmountsByCompanyIdByMonthsForReimbursements,
  type InvoiceDataType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import type {
  EmployeeDatabaseRow,
  ExitsRow,
  InvoiceDatabaseRow,
  PayrollDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { ActiveEmployeesBySite } from "@/components/payroll/analytics/active-employees-by-site";
import { InvoicePaidUnpaid } from "@/components/dashboard/paid-unpaid-invoices";
import { useAnimateTextScroll } from "@canny_ecosystem/ui/animate-text-scroll";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@canny_ecosystem/ui/utils/cn";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const url = new URL(request.url);

  const searchParams = new URLSearchParams(url.searchParams);

  const filters: DashboardFilters = {
    month: searchParams.get("month") ?? undefined,
    year: searchParams.get("year") ?? undefined,
  };
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  try {
    const notificationPromise = getNotificationByCompanyId({
      supabase,
      companyId,
    });

    const exitsPromise = getExitsByCompanyIdByMonths({
      companyId,
      supabase,
      filters,
    });

    const employeesPromise = getActiveEmployeesByCompanyId({
      supabase,
      companyId,
    });

    const payrollPromise = getApprovedPayrollsAmountsByCompanyIdByMonths({
      supabase,
      companyId,
      filters,
    });
    const reimbursementPromise =
      getPaidInvoicesAmountsByCompanyIdByMonthsForReimbursements({
        supabase,
        companyId,
        filters,
      });
    const payrollByYearsPromise = getApprovedPayrollsByCompanyIdByYears({
      companyId,
      supabase,
      filters,
    });

    const invoicePromise = getInvoicesByCompanyIdForDashboard({
      companyId,
      supabase,
      filters,
    });

    return defer({
      companyId,
      notificationPromise,
      reimbursementPromise,
      exitsPromise,
      employeesPromise,
      payrollPromise,
      payrollByYearsPromise,
      invoicePromise,
      filters,
      error: null,
    });
  } catch (error) {
    return defer({
      companyId,
      notificationPromise: Promise.resolve({ data: null, error }),
      exitsPromise: Promise.resolve({
        currentMonthExits: null,
        currentMonthExitErrors: null,
        previousMonthExits: null,
        previousMonthExitErrors: null,
      }),
      employeesPromise: Promise.resolve({
        activeEmployeeError: null,
        activeEmployees: null,
        totalEmployeeError: null,
        totalEmployees: null,
        activeEmployeesBySites: null,
        activeEmployeeErrorBySites: null,
      }),
      payrollPromise: Promise.resolve({
        currentMonth: null,
        currentMonthError: null,
        previousMonth: null,
        previousMonthError: null,
      }),
      reimbursementPromise: Promise.resolve({
        currentMonth: null,
        currentMonthError: null,
        previousMonth: null,
        previousMonthError: null,
      }),
      payrollByYearsPromise: Promise.resolve({ data: null, error }),
      invoicePromise: Promise.resolve({ data: null, error }),
      filters,
      error: error,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.dashboard}${url.searchParams.toString()}`,
    args,
  );
}

clientLoader.hydrate = true;

export default function Dashboard() {
  const {
    companyId,
    notificationPromise,
    exitsPromise,
    employeesPromise,
    payrollPromise,
    reimbursementPromise,
    payrollByYearsPromise,
    invoicePromise,
    filters,
    error,
  } = useLoaderData<typeof loader>();

  if (error) {
    clearCacheEntry(cacheKeyPrefix.dashboard);
    return <ErrorBoundary error={error} message="Failed to load data" />;
  }

  const [searchParams] = useSearchParams();
  const key =
    (searchParams.get("month") ?? "") +
    (searchParams.get("year") ?? "") +
    companyId;

  return (
    <div key={key}>
      <Suspense fallback={null}>
        <Await resolve={notificationPromise}>
          {({ data: notificationData, error: notificationError }) => {
            if (notificationError) {
              clearCacheEntry(cacheKeyPrefix.dashboard);
              return (
                <ErrorBoundary
                  error={notificationError}
                  message="Failed to load Notification"
                />
              );
            }

            const { containerRef, contentRef } = useAnimateTextScroll({
              pauseDurationMs: 2000,
              speed: 1.5,
            });

            return (
              <div
                ref={containerRef}
                className={cn(
                  "overflow-hidden w-full border-b bg-primary/15",
                  !notificationData?.text && "hidden",
                )}
              >
                <div
                  ref={contentRef}
                  className="text-primary whitespace-nowrap p-4"
                >
                  {notificationData?.text}
                  <span aria-hidden className="inline-block w-[17px]" />
                </div>
              </div>
            );
          }}
        </Await>
      </Suspense>

      <section className="w-full p-4 flex flex-col gap-4">
        <div className="flex justify-end">
          <div className="flex justify-between gap-3">
            <FilterList filters={filters as unknown as DashboardFilters} />
            <DashboardFilter />
          </div>
        </div>

        <div className="w-full flex flex-col gap-4">
          <Suspense fallback={<LoadingSpinner className="h-32" />}>
            <Await
              resolve={Promise.all([
                payrollPromise,
                employeesPromise,
                exitsPromise,
                reimbursementPromise,
              ])}
            >
              {([payrollData, employeesData, exitsData, reimbursementData]) => {
                if (payrollData.currentMonthError) {
                  clearCacheEntry(cacheKeyPrefix.dashboard);
                  return (
                    <ErrorBoundary
                      error={payrollData.currentMonthError}
                      message="Failed to load payroll data"
                    />
                  );
                }
                if (reimbursementData.currentMonthError) {
                  clearCacheEntry(cacheKeyPrefix.dashboard);
                  return (
                    <ErrorBoundary
                      error={reimbursementData.currentMonthError}
                      message="Failed to load reimbursement data"
                    />
                  );
                }
                if (employeesData.activeEmployeeError) {
                  clearCacheEntry(cacheKeyPrefix.dashboard);
                  return (
                    <ErrorBoundary
                      error={employeesData.activeEmployeeError}
                      message="Failed to load employee data"
                    />
                  );
                }

                if (exitsData.currentMonthExitErrors) {
                  clearCacheEntry(cacheKeyPrefix.dashboard);
                  return (
                    <ErrorBoundary
                      error={exitsData.currentMonthExitErrors}
                      message="Failed to load exits data"
                    />
                  );
                }

                return (
                  <CountCards
                    currentData={
                      payrollData.currentMonth as unknown as PayrollDatabaseRow[]
                    }
                    previousData={
                      payrollData.previousMonth as unknown as PayrollDatabaseRow[]
                    }
                    reimbursementCurrentData={
                      reimbursementData.currentMonth as unknown as InvoiceDatabaseRow[]
                    }
                    reimbursementPreviousData={
                      reimbursementData.previousMonth as unknown as InvoiceDatabaseRow[]
                    }
                    activeEmployeeCount={
                      employeesData.activeEmployees as unknown as EmployeeDatabaseRow[]
                    }
                    totalEmployeeCount={
                      employeesData.totalEmployees as unknown as EmployeeDatabaseRow[]
                    }
                    currentExits={
                      exitsData.currentMonthExits as unknown as ExitsRow[]
                    }
                    previousExits={
                      exitsData.previousMonthExits as unknown as ExitsRow[]
                    }
                  />
                );
              }}
            </Await>
          </Suspense>

          <Suspense fallback={<LoadingSpinner className="h-64" />}>
            <Await resolve={payrollByYearsPromise}>
              {({ data: payrollDataByYears }) => {
                if (!payrollDataByYears) {
                  clearCacheEntry(cacheKeyPrefix.dashboard);
                  return (
                    <ErrorBoundary
                      error={{ error: "Failed to fetch Data" }}
                      message="Failed to load payroll trend data"
                    />
                  );
                }

                return <PayrollTrend chartData={payrollDataByYears} />;
              }}
            </Await>
          </Suspense>

          <div className="grid grid-cols-3 gap-4">
            <Suspense fallback={<LoadingSpinner className="h-64" />}>
              <Await resolve={employeesPromise}>
                {({ activeEmployeesBySites, activeEmployeeErrorBySites }) => {
                  if (activeEmployeeErrorBySites) {
                    clearCacheEntry(cacheKeyPrefix.dashboard);
                    return (
                      <ErrorBoundary
                        error={activeEmployeeErrorBySites}
                        message="Failed to load employees by site data"
                      />
                    );
                  }

                  return (
                    <ActiveEmployeesBySite
                      chartData={
                        activeEmployeesBySites as unknown as EmployeeDatabaseRow[]
                      }
                    />
                  );
                }}
              </Await>
            </Suspense>

            <Suspense fallback={<LoadingSpinner className="h-64" />}>
              <Await resolve={invoicePromise}>
                {({ data: invoiceData, error: invoiceDataError }) => {
                  if (invoiceDataError) {
                    clearCacheEntry(cacheKeyPrefix.dashboard);
                    return (
                      <ErrorBoundary
                        error={invoiceDataError}
                        message="Failed to load invoice data"
                      />
                    );
                  }

                  return (
                    <InvoicePaidUnpaid
                      chartData={invoiceData as unknown as InvoiceDataType[]}
                    />
                  );
                }}
              </Await>
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
