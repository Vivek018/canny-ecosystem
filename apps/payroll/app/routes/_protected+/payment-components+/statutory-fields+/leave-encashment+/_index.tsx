import { ErrorBoundary } from "@/components/error-boundary";
import { LeaveEncashmentWrapper } from "@/components/statutory-fields/leave-encashment/leave-encashment-wrapper";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getLeaveEncashmentByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { defer, json, type LoaderFunctionArgs } from "@remix-run/node";
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
    const leaveEncashmentPromise = getLeaveEncashmentByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      leaveEncashmentPromise,
      error: null,
    });
  } catch (error) {
    return json(
      {
        error,
        leaveEncashmentPromise: null,
      },
      { status: 500 },
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(cacheKeyPrefix.leave_encashment, args);
}

clientLoader.hydrate = true;

export default function GratuityIndex() {
  const { leaveEncashmentPromise, error } = useLoaderData<typeof loader>();

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.gratuity);
    return (
      <ErrorBoundary error={error} message="Failed to load leave encashment" />
    );
  }

  return (
    <div className="p-4 flex gap-3 place-content-center justify-between">
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={leaveEncashmentPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(cacheKeyPrefix.leave_encashment);
              return (
                <ErrorBoundary message="Failed to load leave encashment" />
              );
            }
            return (
              <LeaveEncashmentWrapper
                data={resolvedData.data}
                error={resolvedData.error}
              />
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
