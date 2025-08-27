import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getVehiclesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@canny_ecosystem/ui/command";
import { useIsDocument } from "@canny_ecosystem/utils/hooks/is-document";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  json,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { LoadingSpinner } from "@/components/loading-spinner";
import { VehiclesWrapper } from "@/components/vehicles/vehicles-wrapper";
import type { VehiclesDatabaseRow } from "@canny_ecosystem/supabase/types";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (user?.role !== "location_incharge") {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const vehiclesPromise = getVehiclesByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      status: "success",
      message: "Vehicless found",
      error: null,
      vehiclesPromise,
    });
  } catch (error) {
    return json(
      {
        status: "error",
        message: "Failed to load vehicles",
        error,
        vehiclesPromise: null,
      },
      { status: 500 }
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.vehicles, args);
}

clientLoader.hydrate = true;

export default function VehiclesIndex() {
  const { vehiclesPromise, error } = useLoaderData<typeof loader>();
  const { isDocument } = useIsDocument();

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.vehicles);
    return <ErrorBoundary error={error} message="Failed to load vehicles" />;
  }

  return (
    <section className="py-4">
      <div className="w-full flex items-end justify-between">
        <Suspense fallback={<LoadingSpinner className="mt-40" />}>
          <Await resolve={vehiclesPromise}>
            {(resolvedData) => {
              if (!resolvedData) {
                clearExactCacheEntry(cacheKeyPrefix.vehicles);
                return <ErrorBoundary message="Failed to load vehicles" />;
              }
              return (
                <Command className="overflow-visible">
                  <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
                    <CommandInput
                      divClassName="border border-input rounded-md h-10 flex-1"
                      placeholder="Search vehicles"
                      autoFocus={true}
                    />
                  </div>
                  <CommandEmpty
                    className={cn(
                      "w-full py-40 capitalize text-lg tracking-wide text-center",
                      !isDocument && "hidden"
                    )}
                  >
                    No vehicles found.
                  </CommandEmpty>
                  <CommandList className="max-h-full py-6 overflow-x-visible overflow-y-visible">
                    <CommandGroup className="p-0 overflow-visible">
                      <VehiclesWrapper
                        data={
                          resolvedData.data as unknown as VehiclesDatabaseRow[]
                        }
                        error={resolvedData.error}
                      />
                    </CommandGroup>
                  </CommandList>
                </Command>
              );
            }}
          </Await>
        </Suspense>
      </div>
      <Outlet />
    </section>
  );
}
