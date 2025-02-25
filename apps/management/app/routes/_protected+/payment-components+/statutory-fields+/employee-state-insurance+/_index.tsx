import { ErrorBoundary } from "@/components/error-boundary";
import LoadingSpinner from "@/components/loading-spinner";
import { ESIWrapper } from "@/components/statutory-fields/employee-state-insurance/esi-wrapper";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getEmployeeStateInsuranceByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const esiPromise = getEmployeeStateInsuranceByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      esiPromise,
      error: null,
    });
  } catch (error) {
    return defer(
      {
        error,
        esiPromise: null,
      },
      { status: 500 },
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.statutory_field_esi, args);
}

clientLoader.hydrate = true;

export default function EmployeeStateInsuranceIndex() {
  const { esiPromise, error } = useLoaderData<typeof loader>();

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.statutory_field_esi);
    return <ErrorBoundary error={error} message="Failed to load ESI" />;
  }

  return (
    <Suspense fallback={<LoadingSpinner className="mt-40" />}>
      <Await resolve={esiPromise}>
        {(resolvedData) => {
          if (!resolvedData) {
            clearExactCacheEntry(cacheKeyPrefix.statutory_field_esi);
            return <ErrorBoundary message="Failed to load ESI" />;
          }
          return (
            <ESIWrapper data={resolvedData.data} error={resolvedData.error} />
          );
        }}
      </Await>
    </Suspense>
  );
}
