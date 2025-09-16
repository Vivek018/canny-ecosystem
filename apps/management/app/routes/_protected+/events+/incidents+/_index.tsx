import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { IncidentsTable } from "@/components/incidents/table/incidents-table";
import {
  type IncidentFilters,
  getIncidentsByCompanyId,
  getProjectNamesByCompanyId,
  getSiteNamesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { columns } from "@/components/incidents/table/columns";
import { FilterList } from "@/components/incidents/filter-list";
import { IncidentActions } from "@/components/incidents/incident-actions";
import { LoadingSpinner } from "@/components/loading-spinner";
import { IncidentSearchFilter } from "@/components/incidents/incident-search-filter";

const pageSize = LAZY_LOADING_LIMIT;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  try {
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${readRole}:${attribute.incidents}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }
    const url = new URL(request.url);
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");

    const query = searchParams.get("name") ?? undefined;

    const filters: IncidentFilters = {
      date_start: searchParams.get("date_start") ?? undefined,
      date_end: searchParams.get("date_end") ?? undefined,
      status: (searchParams.get("status") ??
        undefined) as IncidentFilters["status"],
      location_type: (searchParams.get("location_type") ??
        undefined) as IncidentFilters["location_type"],
      category: (searchParams.get("category") ??
        undefined) as IncidentFilters["category"],
      name: query,
      severity: (searchParams.get("severity") ??
        undefined) as IncidentFilters["severity"],

      project: searchParams.get("project") ?? undefined,
      site: searchParams.get("site") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const incidentPromise = getIncidentsByCompanyId({
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

    const projectPromise = getProjectNamesByCompanyId({ supabase, companyId });

    const sitePromise = getSiteNamesByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      incidentPromise: incidentPromise as any,
      projectPromise,
      sitePromise,
      query,
      filters,
      companyId,
      env,
    });
  } catch (error) {
    console.error("Incidents Error in loader function:", error);

    return defer({
      incidentPromise: Promise.resolve({ data: [] }),
      projectPromise: Promise.resolve({ data: [] }),
      sitePromise: Promise.resolve({ data: [] }),
      query: "",
      filters: null,
      companyId: "",
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);

  return clientCaching(
    `${cacheKeyPrefix.incidents}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export default function IncidentsIndex() {
  const {
    incidentPromise,
    query,
    filters,
    companyId,
    env,
    projectPromise,
    sitePromise,
  } = useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="p-4">
      <div className="w-full flex flex-row max-sm:flex-col max-sm:gap-y-3 items-center justify-between pb-4  max-sm:items-start  max-md:items-start">
        <div className="flex w-[90%] max-sm:w-full flex-col md:flex-row items-start md:items-center gap-2 mr-4">
          <Suspense fallback={<LoadingSpinner className="w-1/2" />}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={sitePromise}>
                  {(siteData) => (
                    <>
                      <IncidentSearchFilter
                        projectArray={
                          projectData?.data?.length
                            ? projectData?.data?.map((project) => project!.name)
                            : []
                        }
                        siteArray={
                          siteData?.data?.length
                            ? siteData?.data?.map((site) => site!.name)
                            : []
                        }
                      />
                      <FilterList filters={filterList} />
                    </>
                  )}
                </Await>
              )}
            </Await>
          </Suspense>
        </div>
        <IncidentActions />
      </div>
      <Suspense fallback={<LoadingSpinner className="h-1/3" />}>
        <Await resolve={incidentPromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.incidents);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load incidents"
                />
              );
            }

            const hasNextPage = Boolean(meta?.count > data?.length);

            return (
              <IncidentsTable
                data={data ?? []}
                columns={columns}
                count={meta?.count ?? 0}
                query={query}
                filters={filters}
                noFilters={noFilters}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                companyId={companyId}
                env={env}
              />
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}
