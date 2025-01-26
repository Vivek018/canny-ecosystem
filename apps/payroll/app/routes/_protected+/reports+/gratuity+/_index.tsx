import { ColumnVisibility } from "@/components/reports/column-visibility";
import { FilterList } from "@/components/reports/gratuity-report/filter-list";
import { GratuityReportSearchFilter } from "@/components/reports/gratuity-report/report-search-filter";
import { columns } from "@/components/reports/gratuity-report/table/columns";
import { DataTable } from "@/components/reports/gratuity-report/table/data-table";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  type EmployeeReportDataType,
  type EmployeeReportFilters,
  getEmployeesReportByCompanyId,
  getGratuityByCompanyId,
  getProjectNamesByCompanyId,
  getSiteNamesByProjectName,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet, redirect, useLoaderData } from "@remix-run/react";

const pageSize = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const page = 0;

  const searchParams = new URLSearchParams(url.searchParams);
  const sortParam = searchParams.get("sort");

  const query = searchParams.get("name") ?? undefined;

  const filters: EmployeeReportFilters = {
    start_month: searchParams.get("start_month") ?? undefined,
    end_month: searchParams.get("end_month") ?? undefined,
    start_year: searchParams.get("start_year") ?? undefined,
    end_year: searchParams.get("end_year") ?? undefined,
    project: searchParams.get("project") ?? undefined,
    project_site: searchParams.get("project_site") ?? undefined,
  };

  const hasFilters =
    filters &&
    Object.values(filters).some(
      (value) => value !== null && value !== undefined,
    );

  const { data, meta, error } = await getEmployeesReportByCompanyId({
    supabase,
    companyId,
    params: {
      from: 0,
      to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
      filters,
      searchQuery: query ?? undefined,
      sort: sortParam?.split(":") as [string, "asc" | "desc"],
    },
  });

  const { data: gratuityData, error: gratuityError } =
    await getGratuityByCompanyId({
      supabase,
      companyId,
    });

  const hasNextPage = Boolean(
    meta?.count && meta.count / (page + 1) > pageSize,
  );

  if (error || gratuityError) {
    throw error;
  }

  const { data: projectData } = await getProjectNamesByCompanyId({
    supabase,
    companyId,
  });

  let projectSiteData = null;
  if (filters.project) {
    const { data } = await getSiteNamesByProjectName({
      supabase,
      projectName: filters.project,
    });
    projectSiteData = data;
  }

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const gratuityReportData = data.map((employee: EmployeeReportDataType) => {
    const gratuityEligibleYears: number = gratuityData?.eligibility_years ?? 5;
    const joining_date = new Date(
      employee.employee_project_assignment.start_date,
    );
    const totalDays = gratuityEligibleYears * 365.25;

    const employeeWorkingYears =
      new Date().getFullYear() - joining_date.getFullYear();

    const presentDaysInYears = {
      first_year: 230,
      second_year: 240,
      third_year: 250,
      fourth_year: 260,
      fifth_year: 250,
    };

    return {
      ...employee,
      ...presentDaysInYears,
      is_eligible_for_gratuity: employeeWorkingYears >= gratuityEligibleYears,
      employee_eligible_date: new Date(
        joining_date.setDate(joining_date.getDate() + totalDays),
      ),
    };
  });

  return json({
    data: gratuityReportData as any,
    gratuityData,
    count: meta?.count,
    query,
    filters,
    hasNextPage,
    companyId,
    projectArray: projectData?.map((project) => project.name) ?? [],
    projectSiteArray: projectSiteData?.map((site) => site.name) ?? [],
    env,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();

  const prompt = formData.get("prompt") as string | null;

  // Prepare search parameters
  const searchParams = new URLSearchParams();
  if (prompt && prompt.trim().length > 0) {
    searchParams.append("name", prompt.trim());
  }

  // Update the URL with the search parameters
  url.search = searchParams.toString();

  return redirect(url.toString());
}

export default function GratuityReport() {
  const {
    data,
    gratuityData,
    count,
    query,
    filters,
    hasNextPage,
    companyId,
    projectArray,
    projectSiteArray,
    env,
  } = useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="py-6 px-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <GratuityReportSearchFilter
            disabled={!data?.length && noFilters}
            projectArray={projectArray}
            projectSiteArray={projectSiteArray}
          />
          <FilterList filterList={filterList} />
        </div>
        <ColumnVisibility disabled={!data?.length} />
      </div>
      <DataTable
        data={data ?? []}
        gratuityEligibleYears={gratuityData?.eligibility_years ?? 0}
        columns={columns()}
        count={count ?? data?.length ?? 0}
        query={query}
        filters={filters}
        noFilters={noFilters}
        hasNextPage={hasNextPage}
        pageSize={pageSize}
        companyId={companyId}
        env={env}
      />
      <Outlet />
    </section>
  );
}
