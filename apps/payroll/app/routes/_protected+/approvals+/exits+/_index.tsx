import { ErrorBoundary } from "@/components/error-boundary";
import { ExitActions } from "@/components/exits/exit-actions";
import { ExitsSearchFilter } from "@/components/exits/exit-search-filter";
import { FilterList } from "@/components/exits/filter-list";
import { ImportExitModal } from "@/components/exits/import-export/import-modal-exits";
import { ExitPaymentColumns } from "@/components/exits/table/columns";
import { ExitPaymentTable } from "@/components/exits/table/data-table";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { LAZY_LOADING_LIMIT, MAX_QUERY_LIMIT } from "@canny_ecosystem/supabase/constant";
import {
  type ExitFilterType, getExits, getProjectNamesByCompanyId, getSiteNamesByProjectName,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Await, type ClientLoaderFunctionArgs, defer, redirect, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

const pageSize = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.reimbursements}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const url = new URL(request.url);
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? undefined;

    const filters: ExitFilterType = {
      last_working_day_start: searchParams.get("last_working_day_start") ?? undefined,
      last_working_day_end: searchParams.get("last_working_day_end") ?? undefined,
      final_settlement_date_start: searchParams.get("final_settlement_date_start") ?? undefined,
      final_settlement_date_end: searchParams.get("final_settlement_date_end") ?? undefined,
      reason: searchParams.get("reason") ?? undefined,
      project: searchParams.get("project") ?? undefined,
      project_site: searchParams.get("project_site") ?? undefined,
    };

    const hasFilters =
      filters && Object.values(filters).some((value) => value !== null && value !== undefined);

    const exitsPromise = getExits({
      supabase,
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });

    const projectPromise = getProjectNamesByCompanyId({ supabase, companyId });

    let projectSitePromise = null;
    if (filters.project)
      projectSitePromise = getSiteNamesByProjectName({ supabase, projectName: filters.project });

    return defer({
      exitsPromise,
      query,
      filters,
      projectPromise,
      projectSitePromise,
      env,
      error: null,
    });
  } catch (error) {
    return defer({
      exitsPromise: null,
      query: null,
      filters: null,
      projectPromise: null,
      projectSitePromise: null,
      env,
      error,
    });
  }
}

// caching
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return await clientCaching(`${cacheKeyPrefix.exits}${url.searchParams.toString()}`, args);
}
clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();

  const prompt = formData.get("prompt") as string | null;

  const searchParams = new URLSearchParams();
  if (prompt && prompt.trim().length > 0) searchParams.append("name", prompt.trim());

  url.search = searchParams.toString();

  return redirect(url.toString());
}

export default function ExitsIndex() {
  const {
    exitsPromise,
    query,
    filters,
    env,
    projectPromise,
    projectSitePromise,
  } = useLoaderData<typeof loader>();

  const noFilters = filters ? Object.values(filters).every((value) => !value) : true;
  const filterList = { ...filters, name: query };

  return (
    <section className="p-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-4">
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={projectSitePromise}>
                  {(projectSiteData) => {
                    if (projectSiteData?.error) {
                      clearCacheEntry(cacheKeyPrefix.exits);
                      return <ErrorBoundary error={projectSiteData?.error} message="Failed to load Exits" />
                    }
                    const projectArray = projectData?.data?.map((project) => project.name) ?? [];
                    const projectSiteArray = projectSiteData?.data?.map((site) => site.name) ?? [];

                    return (
                      <>
                        <ExitsSearchFilter
                          disabled={!exitsPromise && noFilters}
                          projectArray={projectArray}
                          projectSiteArray={projectSiteArray}
                        />
                        <FilterList filterList={filterList} />
                      </>
                    );
                  }}
                </Await>
              )}
            </Await>
          </Suspense>
        </div>
        <div className="flex-shrink-0">
          <ExitActions isEmpty={!exitsPromise} />
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <Await
          resolve={exitsPromise}
          errorElement={<div>Sorry, Exit data can't be loaded. Try again later!</div>}
        >
          {(exitsData) => {
            if (exitsData?.error) {
              clearCacheEntry(cacheKeyPrefix.exits);
              return <ErrorBoundary error={exitsData?.error} message="Failed to load Exits" />
            }
            const hasNextPage = Boolean(exitsData?.meta?.count && exitsData.meta.count > LAZY_LOADING_LIMIT);
            return (
              <ExitPaymentTable
                data={exitsData?.data ?? [] as any}
                columns={ExitPaymentColumns}
                count={exitsData?.meta?.count ?? exitsData?.data?.length ?? 0}
                query={query}
                noFilters={noFilters}
                filters={filters}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                env={env}
              />
            );
          }}
        </Await>
      </Suspense>
      <ImportExitModal />
    </section>
  );
}