import { DashboardFilter } from "@/components/dashboard/dashboard-filter";
import { FilterList } from "@/components/dashboard/filter-list";
import { ErrorBoundary } from "@/components/error-boundary";
import { PayrollInfoCard } from "@/components/payroll/analytics/payroll-info-card";
import { PayrollTopSite } from "@/components/payroll/analytics/payroll-top-site";
import { PayrollTrend } from "@/components/payroll/analytics/payroll-trend";
import { StatutoryRatio } from "@/components/payroll/analytics/statutory-ratio";
import { cacheKeyPrefix } from "@/constant";
import { clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getEmployeesCountByCompanyId,
  getLocationsCountByCompanyId,
  getPayrollEntriesWithTemplateComponentsByPayrollId,
  getPayrollWithSiteBySiteId,
  getProjectsCountByCompanyId,
  getSitesByCompanyId,
  getUsersCount,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { type ClientLoaderFunctionArgs, useLoaderData } from "@remix-run/react";

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
  totalEmployees: number | undefined | null;
  totalProjects: number | undefined | null;
  totalLocations: number | undefined | null;
  totalUsers: number | undefined | null;
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

    const {
      data: sitesData,
      count: sitesCount,
      error: sitesError,
    } = await getSitesByCompanyId({
      supabase,
      companyId,
    });

    if (sitesError) throw sitesError;

    const { count: projectsCount } = await getProjectsCountByCompanyId({
      supabase,
      companyId,
    });

    const { count: usersCount } = await getUsersCount({ supabase });
    const { count: locationsCount } = await getLocationsCountByCompanyId({
      supabase,
      companyId,
    });
    const { count: employeesCount } = await getEmployeesCountByCompanyId({
      supabase,
      companyId,
    });

    const { data: payrollData, error: payrollError } =
      await getPayrollWithSiteBySiteId({
        supabase,
        site_id: sitesData?.map((site) => site.id) || [],
        params: {
          filters,
        },
      });

    if (payrollError) throw payrollError;

    const payrollIds = payrollData?.map((payroll) => payroll.id) || [];

    const { data: payrollEntriesData, error: payrollEntriesError } =
      await getPayrollEntriesWithTemplateComponentsByPayrollId({
        supabase,
        payrollIds,
      });

    if (payrollEntriesError) throw new Error(payrollEntriesError.message);

    return json({
      payrollData,
      payrollEntriesData,
      projectsCount,
      sitesCount,
      usersCount,
      locationsCount,
      employeesCount,
      filters,
      error: null,
    });
  } catch (error) {
    return json({
      payrollData: null,
      payrollEntriesData: null as any,
      projectsCount: 0,
      sitesCount: 0,
      usersCount: 0,
      locationsCount: 0,
      employeesCount: 0,
      filters,
      error: error,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(cacheKeyPrefix.dashboard, args);
}

clientLoader.hydrate = true;

export default function Dashboard() {
  const {
    payrollData,
    payrollEntriesData,
    projectsCount,
    sitesCount,
    usersCount,
    locationsCount,
    employeesCount,
    filters,
    error,
  } = useLoaderData<typeof loader>();

  const cardData: CardInfoData = {
    totalEmployees: employeesCount,
    totalSites: sitesCount,
    totalProjects: projectsCount,
    totalLocations: locationsCount,
    totalUsers: usersCount,
  };

  if (error)
    return <ErrorBoundary error={error} message="Failed to load data" />;

  return (
    <section className="w-full p-4 flex flex-col gap-4">
      <div className="flex justify-end">
        <div className="flex justify-between gap-3">
          <FilterList filterList={filters} />
          <DashboardFilter />
        </div>
      </div>
      <div className="w-full flex flex-col gap-4">
        <PayrollTrend chartData={payrollData} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <PayrollInfoCard cardData={cardData} />

          <StatutoryRatio chartData={payrollEntriesData} />

          <PayrollTopSite chartData={payrollData} />
        </div>
      </div>
    </section>
  );
}
