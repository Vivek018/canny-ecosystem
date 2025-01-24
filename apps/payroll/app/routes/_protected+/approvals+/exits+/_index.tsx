import { ExitActions } from "@/components/exits/exit-actions";
import { ExitsSearchFilter } from "@/components/exits/exit-search-filter";
import { FilterList } from "@/components/exits/filter-list";
import { ExitPaymentColumns } from "@/components/exits/table/columns";
import { ExitPaymentTable } from "@/components/exits/table/data-table";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  type ExitFilterType,
  getExits,
  getProjectNamesByCompanyId,
  getSiteNamesByProjectName,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect, useLoaderData } from "@remix-run/react";

const pageSize = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });

  

  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const url = new URL(request.url);
  const page = 0;
  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");

    const query = searchParams.get("name") ?? undefined;

    const filters: ExitFilterType = {
      last_working_day_start:
        searchParams.get("last_working_day_start") ?? undefined,
      last_working_day_end:
        searchParams.get("last_working_day_end") ?? undefined,
      final_settlement_date_start:
        searchParams.get("final_settlement_date_start") ?? undefined,
      final_settlement_date_end:
        searchParams.get("final_settlement_date_end") ?? undefined,
      reason: searchParams.get("reason") ?? undefined,
      project: searchParams.get("project") ?? undefined,
      project_site: searchParams.get("project_site") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const { data, meta, error } = await getExits({
      supabase,
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });

    const hasNextPage = Boolean(
      meta?.count && meta.count / (page + 1) > LAZY_LOADING_LIMIT
    );

    if (error) {
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

    return json({
      data: data as any,
      count: meta?.count,
      query,
      filters,
      hasNextPage,
      projectArray: projectData?.map((project) => project.name) ?? [],
      projectSiteArray: projectSiteData?.map((site) => site.name) ?? [],
      env,
      error: null,
    });
  } catch (error) {
    return json({
      data: null,
      count: 0,
      query: null,
      filters: null,
      hasNextPage: false,
      projectArray: null,
      projectSiteArray: null,
      env,
      error,
    });
  }
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

export default function ExitsIndex() {
  const {
    data,
    count,
    query,
    filters,
    hasNextPage,
    env,
    projectArray,
    projectSiteArray,
  } = useLoaderData<typeof loader>();

  const noFilters = filters
    ? Object.values(filters).every((value) => !value)
    : true;
  const filterList = { ...filters, name: query };

  return (
    <section className="m-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <ExitsSearchFilter
            disabled={!data?.length && noFilters}
            projectArray={projectArray}
            projectSiteArray={projectSiteArray}
          />
          <FilterList filterList={filterList} />
        </div>
        <div className="space-x-2 hidden md:flex">
          <ExitActions isEmpty={!data?.length} />
        </div>
      </div>
      <ExitPaymentTable
        data={data ?? []}
        columns={ExitPaymentColumns}
        count={count ?? data?.length ?? 0}
        query={query}
        noFilters={noFilters}
        filters={filters}
        hasNextPage={hasNextPage}
        pageSize={pageSize}
        env={env}
      />
    </section>
  );
}
