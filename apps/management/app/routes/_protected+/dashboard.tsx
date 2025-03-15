import { DashboardFilter } from "@/components/dashboard/dashboard-filter";
import { FilterList } from "@/components/dashboard/filter-list";
import { RecentEmployeesDataTable } from "@/components/dashboard/recent-employees-table/data-table";
import { employeeColumns } from "@/components/dashboard/recent-employees-table/columns";
import { exitColumns } from "@/components/dashboard/recent-exit-table/columns";
import { RecentExitsDataTable } from "@/components/dashboard/recent-exit-table/data-table";
import { reimbursementColumns } from "@/components/dashboard/recent-reimbursement-table/columns";
import { RecentReimbursementDataTable } from "@/components/dashboard/recent-reimbursement-table/reimbursement-data-table";
import { CountCards } from "@/components/dashboard/count-cards";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PayrollTrend } from "@/components/payroll/analytics/payroll-trend";
import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getRecentEmployeesByCompanyId,
  getRecentExitsByCompanyId,
  getRecentReimbursementsByCompanyId,
  getSitesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";

export type PayrollFilterType = {
  start_month?: string | undefined | null;
  end_month?: string | undefined | null;
  start_year?: string | undefined | null;
  end_year?: string | undefined | null;
};

export type AttendanceFilterType = {
  year?: string | undefined | null;
  month?: string | undefined | null;
  project?: string | undefined | null;
  project_site?: string | undefined | null;
};

export type CardInfoData = {
  totalSites: number | undefined | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  const url = new URL(request.url);

  const searchParams = new URLSearchParams(url.searchParams);

  const filters: PayrollFilterType = {
    start_month: searchParams.get("start_month") ?? undefined,
    end_month: searchParams.get("end_month") ?? undefined,
    start_year: searchParams.get("start_year") ?? undefined,
    end_year: searchParams.get("end_year") ?? undefined,
  };

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { count: sitesCount, error: sitesError } = await getSitesByCompanyId({
      supabase,
      companyId,
    });

    if (sitesError) throw sitesError;

    


    const recentEmployeesPromise = getRecentEmployeesByCompanyId({
      supabase,
      companyId,
    });

    const recentReimbursementsPromise = getRecentReimbursementsByCompanyId({
      supabase,
      companyId,
    });

    const recentExitsPromise = getRecentExitsByCompanyId({
      supabase,
    });

    return defer({
      payrollData: null,
      sitesCount,
      recentEmployeesPromise,
      recentReimbursementsPromise,
      recentExitsPromise,
      filters,
      error: null,
    });
  } catch (error) {
    return defer({
      payrollData: null,
      sitesCount: 0,
      recentEmployeesPromise: null,
      recentReimbursementsPromise: null,
      recentExitsPromise: null,
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
    payrollData,
    sitesCount,
    recentEmployeesPromise,
    recentReimbursementsPromise,
    recentExitsPromise,
    filters,
    error,
  } = useLoaderData<typeof loader>();

  const cardData: CardInfoData = {
    totalSites: sitesCount,
  };

  if (error) {
    clearCacheEntry(cacheKeyPrefix.dashboard);
    return <ErrorBoundary error={error} message="Failed to load data" />;
  }

  return (
    <section className="w-full p-4 flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="flex justify-between gap-3">
          <FilterList filterList={filters} />
          <DashboardFilter />
        </div>
      </div>
      <div className="w-full flex flex-col gap-4">
        <CountCards cardData={cardData} />
        <PayrollTrend chartData={payrollData} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Suspense fallback={<LoadingSpinner />}>
            <div className="flex flex-col justify-start gap-4">
              <h1 className="text-lg font-semibold ml-1">
                Recent Active Employees
              </h1>
              <Await resolve={recentEmployeesPromise}>
                {(resolvedData) => {
                  if (resolvedData?.error)
                    return (
                      <ErrorBoundary
                        error={resolvedData.error}
                        message="Failed to load employee data"
                      />
                    );
                  return (
                    <RecentEmployeesDataTable
                      columns={employeeColumns}
                      data={resolvedData?.data || []}
                    />
                  );
                }}
              </Await>
            </div>
            <div className="flex flex-col justify-start gap-4">
              <h1 className="text-lg font-semibold ml-1">
                Recent Reimbursements
              </h1>
              <Await resolve={recentReimbursementsPromise}>
                {(resolvedData) => {
                  if (resolvedData?.error)
                    return (
                      <ErrorBoundary
                        error={resolvedData.error}
                        message="Failed to load reimbursement data"
                      />
                    );
                  return (
                    <RecentReimbursementDataTable
                      columns={reimbursementColumns}
                      data={resolvedData?.data || []}
                    />
                  );
                }}
              </Await>
            </div>
            <div className="flex flex-col justify-start gap-4">
              <h1 className="text-lg font-semibold ml-1">Recent Exits</h1>
              <Await resolve={recentExitsPromise}>
                {(resolvedData) => {
                  if (resolvedData?.error)
                    return (
                      <ErrorBoundary
                        error={resolvedData.error}
                        message="Failed to load exit data"
                      />
                    );
                  return (
                    <RecentExitsDataTable
                      columns={exitColumns}
                      data={resolvedData?.data || []}
                    />
                  );
                }}
              </Await>
            </div>
          </Suspense>
        </div>
      </div>
    </section>
  );
}
