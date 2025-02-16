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
import { AccidentsTable } from "@/components/accidents/table/accidents-table";
import {
  type AccidentFilters,
  getAccidentsByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { columns } from "@/components/accidents/table/columns";
import { FilterList } from "@/components/accidents/filter-list";
import { AccidentSearchFilter } from "@/components/accidents/accident-search-filter";

const pageSize = LAZY_LOADING_LIMIT;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.accidents}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    const url = new URL(request.url);
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");

    const query = searchParams.get("name") ?? undefined;

    const filters: AccidentFilters = {
      date_start: searchParams.get("date_start") ?? undefined,
      date_end: searchParams.get("date_end") ?? undefined,
      status: (searchParams.get("status") ??
        undefined) as AccidentFilters["status"],
      location_type: (searchParams.get("location_type") ??
        undefined) as AccidentFilters["location_type"],
      category: (searchParams.get("category") ??
        undefined) as AccidentFilters["category"],
      name: query,
      severity: (searchParams.get("severity") ??
        undefined) as AccidentFilters["severity"],
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined,
      );

    const accidentsPromise = getAccidentsByCompanyId({
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
      accidentsPromise: accidentsPromise as any,
      query,
      filters,
      companyId,
      env,
    });
  } catch (error) {
    console.error("Accidents Error in loader function:", error);

    return defer({
      accidentsPromise: Promise.resolve({ data: [] }),
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
    `${cacheKeyPrefix.accident}${url.searchParams.toString()}`,
    args,
  );
}

clientLoader.hydrate = true;

export default function AccidentsIndex() {
  const { accidentsPromise, query, filters, companyId, env } =
    useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="p-4">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <AccidentSearchFilter />
          <FilterList filters={filterList} />
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={accidentsPromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.accident);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load accidents"
                />
              );
            }

            const hasNextPage = Boolean(meta?.count > pageSize);

            return (
              <AccidentsTable
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
