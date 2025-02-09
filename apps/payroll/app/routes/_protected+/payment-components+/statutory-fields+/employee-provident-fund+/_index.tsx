import { ErrorBoundary } from "@/components/error-boundary";
import { EPFWrapper } from "@/components/statutory-fields/employee-provident-fund/epf-wrapper";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getEmployeeProvidentFundByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { type LoaderFunctionArgs, defer } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });

    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const epfPromise = getEmployeeProvidentFundByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      error: null,
      epfPromise,
    });
  } catch (error) {
    return defer(
      {
        error,
        epfPromise: null,
      },
      { status: 500 }
    );
  }
};

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(cacheKeyPrefix.statutory_field_epf, args);
}

clientLoader.hydrate = true;

export default function EmployeeProvidentFundIndex() {
  const { epfPromise, error } = useLoaderData<typeof loader>();

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.statutory_field_epf);
    return <ErrorBoundary error={error} message='Failed to load data' />;
  }

  return (
    <div className='p-4 flex gap-3 place-content-center justify-between'>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={epfPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(cacheKeyPrefix.statutory_field_epf);
              return <ErrorBoundary message='Failed to load data' />;
            }
            return (
              <EPFWrapper
                data={resolvedData.data as any}
                error={resolvedData.error}
              />
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
