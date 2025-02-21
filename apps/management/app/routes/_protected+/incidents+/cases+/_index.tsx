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
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import {
  type CaseFilters,
  getCasesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { columns } from "@/components/cases/table/columns";
import { FilterList } from "@/components/cases/filter-list";
import { CasesTable } from "@/components/cases/table/cases-table";
import { CaseSearchFilter } from "@/components/cases/case-search-filter";
import { CaseActions } from "@/components/cases/case-actions";

const pageSize = LAZY_LOADING_LIMIT;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.cases}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    const url = new URL(request.url);
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");

    const query = searchParams.get("name") ?? undefined;

    const filters: CaseFilters = {
      case_type: searchParams.get("case_type") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      reported_on: searchParams.get("reported_on") ?? undefined,
      reported_by: searchParams.get("reported_by") ?? undefined,
      date_start: searchParams.get("date_start") ?? undefined,
      date_end: searchParams.get("date_end") ?? undefined,
      incident_date_start: searchParams.get("incident_date_start") ?? undefined,
      incident_date_end: searchParams.get("incident_date_end") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      resolution_date_start:
        searchParams.get("resolution_date_start") ?? undefined,
      resolution_date_end: searchParams.get("resolution_date_end") ?? undefined,
      location_type: searchParams.get("location_type") ?? undefined,
      // name: query,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined,
      );

    const casesPromise = getCasesByCompanyId({
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

    return defer({
      casesPromise: casesPromise as any,
      query,
      filters,
      companyId,
      env,
    });
  } catch (error) {
    console.error("Cases Error in loader function:", error);

    return defer({
      casesPromise: Promise.resolve({ data: [] }),
      query: "",
      filters: null,
      companyId: "",
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);

  return await clientCaching(
    `${cacheKeyPrefix.case}${url.searchParams.toString()}`,
    args,
  );
}

clientLoader.hydrate = true;

export default function CasesIndex() {
  const { casesPromise, query, companyId, filters, env } =
    useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="p-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <CaseSearchFilter />
          <FilterList filters={filterList} />
        </div>
        <CaseActions />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={casesPromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.case);
              return (
                <ErrorBoundary error={error} message="Failed to load cases" />
              );
            }

            const hasNextPage = Boolean(meta?.count > pageSize);

            return (
              <CasesTable
                data={data ?? []}
                columns={columns}
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
      <Outlet />
    </section>
  );
}
