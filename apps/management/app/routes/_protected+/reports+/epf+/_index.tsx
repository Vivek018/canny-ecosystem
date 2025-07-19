import { FilterList } from "@/components/reports/epf-report/filter-list";
import { EPFReportSearchFilter } from "@/components/reports/epf-report/report-search-filter";
import { columns } from "@/components/reports/epf-report/table/columns";
import { DataTable } from "@/components/reports/epf-report/table/data-table";
import { ColumnVisibility } from "@/components/reports/column-visibility";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  type EmployeeReportDataType,
  type EmployeeReportFilters,
  getEmployeesReportByCompanyId,
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
    site: searchParams.get("site") ?? undefined,
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

  const hasNextPage = Boolean(
    meta?.count && meta.count / (page + 1) > pageSize,
  );

  if (error) {
    throw error;
  }

  const { data: projectData } = await getProjectNamesByCompanyId({
    supabase,
    companyId,
  });

  let siteData = null;
  if (filters.project) {
    const { data } = await getSiteNamesByProjectName({
      supabase,
      projectName: filters.project,
    });
    siteData = data;
  }

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const epfReportData = data.map((employee: EmployeeReportDataType) => {
    return {
      ...employee,
      pf_acc_number: "vregerg",
      uan: "4214155125",
      pf_wage: 42141,
      employee_pf_amount: 4324,
      employee_vpf_amount: 41234,
      employer_pf_amount: 432143,
      employer_eps_amount: 4324,
      employer_edli_contribution: 22414,
      employer_pf_admin_charges: 4324,
      total_contribution: 5245,
      start_date: new Date(),
      end_date: new Date(),
    };
  });

  return json({
    data: epfReportData as any,
    count: meta?.count,
    query,
    filters,
    hasNextPage,
    companyId,
    projectArray: projectData?.map((project) => project.name) ?? [],
    siteArray: siteData?.map((site) => site.name) ?? [],
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

export default function EPFReport() {
  const {
    data,
    count,
    query,
    filters,
    hasNextPage,
    companyId,
    projectArray,
    siteArray,
    env,
  } = useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="py-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <EPFReportSearchFilter
            disabled={!data?.length && noFilters}
            projectArray={projectArray}
            siteArray={siteArray}
          />
          <FilterList filterList={filterList} />
        </div>
        <ColumnVisibility disabled={!data?.length} />
      </div>
      <DataTable
        data={data ?? []}
        columns={columns()}
        count={count ?? 0}
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
