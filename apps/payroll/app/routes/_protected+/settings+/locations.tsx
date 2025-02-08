import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getLocationsByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { LocationsWrapper } from "@/components/locations/locations-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const locationsPromise = getLocationsByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      locationsPromise,
      error: null,
    });
  } catch (error) {
    return defer({
      error,
      locationsPromise: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(cacheKeyPrefix.locations, args);
}

clientLoader.hydrate = true;

export default function Locations() {
  const { locationsPromise, error } = useLoaderData<typeof loader>();

  if (error) {
    clearCacheEntry(cacheKeyPrefix.locations);
    return <ErrorBoundary error={error} message='Failed to load locations' />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={locationsPromise}>
        {(resolvedData) => {
          if (!resolvedData) {
            clearCacheEntry(cacheKeyPrefix.locations);
            return <ErrorBoundary message='Failed to load locations' />;
          }
          return (
            <LocationsWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}
