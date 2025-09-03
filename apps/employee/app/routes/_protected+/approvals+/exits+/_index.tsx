import { ErrorBoundary } from "@/components/error-boundary";
import { ExitActions } from "@/components/exits/exit-actions";
import { ExitsSearchFilter } from "@/components/exits/exit-search-filter";
import { FilterList } from "@/components/exits/filter-list";
import { ExitPaymentColumns } from "@/components/exits/table/columns";
import { ExitPaymentTable } from "@/components/exits/table/data-table";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  type ExitFilterType,
  getExitsBySiteIds,
  getSitesByLocationId,
  getUserByEmail,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";

const pageSize = 20;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  const { data: userProfile, error: userProfileError } = await getUserByEmail({
    email: user?.email || "",
    supabase,
  });
  if (user?.role !== "location_incharge") {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  if (user?.role === "location_incharge" && !userProfile?.location_id)
    throw new Error("No location id found");

  if (userProfileError) throw userProfileError;

  try {
    const url = new URL(request.url);
    const page = 0;

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
      in_invoice: searchParams.get("in_invoice") ?? undefined,
      site: searchParams.get("site") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined,
      );
    const { data } = await getSitesByLocationId({
      locationId: userProfile?.location_id!,
      supabase,
    });

    const siteIdsArray = data?.map((dat) => dat.id).filter(Boolean) as string[];
    const siteOptions = data?.length ? data?.map((site) => site!.name) : [];

    const exitsPromise = getExitsBySiteIds({
      supabase,
      siteIds: siteIdsArray ?? [],
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });

    return defer({
      exitsPromise: exitsPromise as any,
      siteIdsArray,
      siteOptions,
      query,
      filters,
      env,
      error: null,
    });
  } catch (error) {
    return defer({
      exitsPromise: null,
      query: null,
      siteOptions: [],
      siteIdsArray: [],
      filters: null,
      env,
      error,
    });
  }
}

// caching
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.exits}${url.searchParams.toString()}`,
    args,
  );
}
clientLoader.hydrate = true;

export default function ExitsIndex() {
  const { exitsPromise, query, filters, env, siteIdsArray, siteOptions } =
    useLoaderData<typeof loader>();

  const noFilters = filters
    ? Object.values(filters).every((value) => !value)
    : true;
  const filterList = { ...filters, name: query };

  return (
    <section className="py-4 overflow-hidden">
      <div className="w-full flex items-start md:items-center justify-between gap-2 pb-4">
        <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <ExitsSearchFilter siteOptions={siteOptions as string[]} />
          <FilterList filterList={filterList} />
        </div>
        <div className="flex-shrink-0">
          <ExitActions isEmpty={!exitsPromise} env={env} />
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner className="ml-10" />}>
        <Await
          resolve={exitsPromise}
          errorElement={
            <div>Sorry, Exit data can't be loaded. Try again later!</div>
          }
        >
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.exits);
              return (
                <ErrorBoundary error={error} message="Failed to load Exits" />
              );
            }
            const hasNextPage = Boolean(
              meta?.count && meta.count > LAZY_LOADING_LIMIT,
            );

            return (
              <ExitPaymentTable
                data={data ?? []}
                columns={ExitPaymentColumns}
                count={meta?.count ?? data?.length ?? 0}
                query={query}
                noFilters={noFilters}
                filters={filters}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                env={env}
                siteIdsArray={siteIdsArray as string[]}
              />
            );
          }}
        </Await>
      </Suspense>
    </section>
  );
}
