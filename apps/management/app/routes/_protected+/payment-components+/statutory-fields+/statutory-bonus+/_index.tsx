import { ErrorBoundary } from "@/components/error-boundary";
import { StatutoryBonusWrapper } from "@/components/statutory-fields/statutory-bonus/statutory-bonus-wrapper";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getStatutoryBonusByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const statutoryBonusPromise = getStatutoryBonusByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      statutoryBonusPromise,
      error: null,
    });
  } catch (error) {
    return defer(
      {
        statutoryBonusPromise: null,
        error,
      },
      { status: 500 },
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(cacheKeyPrefix.statutory_bonus, args);
}

clientLoader.hydrate = true;

export default function StatutoryBonusIndex() {
  const { statutoryBonusPromise, error } = useLoaderData<typeof loader>();

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.statutory_bonus);
    return (
      <ErrorBoundary error={error} message="Failed to load Statutory Bonus" />
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={statutoryBonusPromise}>
        {(resolvedData) => {
          if (!resolvedData) {
            clearExactCacheEntry(cacheKeyPrefix.statutory_bonus);
            return <ErrorBoundary message="Failed to load Statutory Bonus" />;
          }
          return (
            <StatutoryBonusWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}
