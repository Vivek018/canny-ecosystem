import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  type VehicleUsageFilters,
  getVehicleUsageBySiteIds,
  getSitesByLocationId,
  getUserByEmail,
  getVehiclesBySiteIds,
} from "@canny_ecosystem/supabase/queries";
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
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { LoadingSpinner } from "@/components/loading-spinner";
import { VehicleUsageSearchFilter } from "@/components/vehicles/usage/vehicle-usage-search-filters";
import { VehicleUsageTable } from "@/components/vehicles/usage/table/vehicle-usage-table";
import { FilterList } from "@/components/vehicles/usage/filter-list";
import { columns } from "@/components/vehicles/usage/table/columns";
import { VehicleUsageActions } from "@/components/vehicles/usage/vehicle-usage-actions";

const pageSize = LAZY_LOADING_LIMIT;

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
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? undefined;

    const filters: VehicleUsageFilters = {
      name: query,
      month: searchParams.get("month") ?? undefined,
      site: searchParams.get("site") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      vehicle_no: searchParams.get("vehicle_no") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined,
      );
    const { data: siteData } = await getSitesByLocationId({
      locationId: userProfile?.location_id!,
      supabase,
    });

    const siteIdsArray = siteData
      ?.map((dat) => dat.id)
      .filter(Boolean) as string[];

    const vehicleUsagePromise = getVehicleUsageBySiteIds({
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

    const { data } = await getVehiclesBySiteIds({
      supabase,
      siteId: siteIdsArray ?? [],
    });

    const vehicleOptions = data?.length
      ? data?.map((vehicle) => vehicle!.registration_number)
      : [];

    const siteOptions = siteData?.length
      ? siteData?.map((site) => site!.name)
      : [];

    return defer({
      vehicleUsagePromise: vehicleUsagePromise as any,
      siteIdsArray,
      vehicleOptions,
      siteOptions,
      query,
      filters,
      companyId,
      env,
    });
  } catch (error) {
    console.error("Vehicle Usage Error in loader function:", error);

    return defer({
      vehicleUsagePromise: Promise.resolve({ data: [] }),
      siteIdsArray: [],
      query: "",
      filters: null,
      vehicleOptions: [],
      siteOptions: [],
      companyId: "",
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.vehicle_usage}${url.searchParams.toString()}`,
    args,
  );
}

clientLoader.hydrate = true;

export default function VehicleUsageIndex() {
  const {
    vehicleUsagePromise,
    vehicleOptions,
    siteIdsArray,
    query,
    filters,
    companyId,
    siteOptions,
    env,
  } = useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="py-4 overflow-hidden max-sm:py-2">
      <div className="w-full flex flex-row justify-between gap-4 pb-4">
        <div className="flex w-full md:w-[90%] flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-2">
          <VehicleUsageSearchFilter
            vehicleOptions={vehicleOptions as unknown as string[]}
            siteOptions={siteOptions as string[]}
          />
          <FilterList filters={filterList} />
        </div>
        <div className="flex justify-end w-auto">
          <VehicleUsageActions isEmpty={!vehicleUsagePromise} />
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner className="h-1/3" />}>
        <Await resolve={vehicleUsagePromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.vehicle_usage);
              return (
                <ErrorBoundary error={error} message="Failed to load usages" />
              );
            }

            const hasNextPage = Boolean(meta?.count && meta.count > pageSize);

            return (
              <VehicleUsageTable
                data={data ?? []}
                columns={columns()}
                query={query}
                filters={filters}
                noFilters={noFilters}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                companyId={companyId}
                env={env}
                siteIdsArray={siteIdsArray as string[]}
              />
            );
          }}
        </Await>
      </Suspense>
      <Outlet />
    </section>
  );
}
