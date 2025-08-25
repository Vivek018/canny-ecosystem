import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getSiteNamesByCompanyId,
  type VehicleUsageFilters,
  getVehicleUsageByCompanyId,
  getVehiclesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Outlet,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { LoadingSpinner } from "@/components/loading-spinner";
import { VehicleUsageSearchFilter } from "@/components/vehicles/usage/vehicle-usage-search-filters";
import { VehicleUsageTable } from "@/components/vehicles/usage/table/vehicle-usage-table";
import { FilterList } from "@/components/vehicles/usage/filter-list";
import { columns } from "@/components/vehicles/usage/table/columns";
import { VehicleUsageActions } from "@/components/vehicles/usage/vehicle-usage-actions";
import { ImportVehicleUsageModal } from "@/components/vehicles/usage/import-export/import-modal-vehicle-usage";
import { generateVehicleUsageFilter } from "@/utils/ai/vehicle-usage";

const pageSize = LAZY_LOADING_LIMIT;

export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.vehicle_usage}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const url = new URL(request.url);
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? undefined;

    const filters: VehicleUsageFilters = {
      name: query,
      site: searchParams.get("site") ?? undefined,
      month: searchParams.get("month") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      vehicle_no: searchParams.get("vehicle_no") ?? undefined,
      recently_added: searchParams.get("recently_added") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const vehicleUsagePromise = getVehicleUsageByCompanyId({
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

    const { data } = await getVehiclesByCompanyId({
      supabase,
      companyId,
    });
    const vehicleOptions = data?.length
      ? data?.map((vehicle) => vehicle!.registration_number)
      : [];

    const sitePromise = getSiteNamesByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      vehicleUsagePromise: vehicleUsagePromise as any,
      sitePromise,
      vehicleOptions,
      query,
      filters,
      companyId,
      env,
    });
  } catch (error) {
    console.error("Vehicle Usage Error in loader function:", error);

    return defer({
      vehicleUsagePromise: Promise.resolve({ data: [] }),
      sitePromise: Promise.resolve({ data: [] }),
      query: "",
      filters: null,
      vehicleOptions: [],
      companyId: "",
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.vehicle_usage}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;

    const { object } = await generateVehicleUsageFilter({ input: prompt });

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(object)) {
      if (value !== null && value !== undefined && String(value)?.length) {
        searchParams.append(key, value.toString());
      }
    }

    url.search = searchParams.toString();

    return redirect(url.toString());
  } catch (error) {
    console.error("Reimbursement Error in action function:", error);

    const fallbackUrl = new URL(request.url);
    fallbackUrl.search = "";
    return redirect(fallbackUrl.toString());
  }
}

export default function VehicleUsageIndex() {
  const {
    vehicleUsagePromise,
    vehicleOptions,
    sitePromise,
    query,
    filters,
    companyId,
    env,
  } = useLoaderData<typeof loader>();

  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="py-4 overflow-hidden">
      <div className="w-full flex items-center justify-between pb-4">
        <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4">
          <Suspense fallback={<LoadingSpinner className="ml-14" />}>
            <Await resolve={sitePromise}>
              {(siteData) => (
                <VehicleUsageSearchFilter
                  siteArray={
                    siteData?.data?.length
                      ? siteData?.data?.map((site) => site!.name)
                      : []
                  }
                  vehicleOptions={vehicleOptions as unknown as string[]}
                />
              )}
            </Await>
          </Suspense>
          <FilterList filters={filterList} />
        </div>
        <VehicleUsageActions isEmpty={!vehicleUsagePromise} />
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

            const hasNextPage = Boolean(meta?.count > data?.length);

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
              />
            );
          }}
        </Await>
      </Suspense>
      <ImportVehicleUsageModal />
      <Outlet />
    </section>
  );
}
