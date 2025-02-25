import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PaySequenceCard } from "@/components/sites/pay-sequence/pay-sequence-card";
import { SiteDetailsCard } from "@/components/sites/site-details-card";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import {
  getSiteById,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { Suspense } from "react";

// loader
export async function loader({ request, params }: LoaderFunctionArgs) {
  const siteId = params.siteId as string;
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const sitePromise = getSiteById({ supabase, id: siteId });
    return defer({ sitePromise, error: null });
  } catch (error) {
    return defer(
      { sitePromise: null, error },
      { status: 500 }
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    `${cacheKeyPrefix.site_overview}${args.params.siteId}`,
    args,
  );
}

clientLoader.hydrate = true;

export default function Overview() {
  const { sitePromise, error } =
    useLoaderData<typeof loader>();

  const { siteId } = useParams();

  if (error) {
    clearExactCacheEntry(`${cacheKeyPrefix.site_overview}${siteId}`);
    return (
      <ErrorBoundary error={error} message="Failed to load site details" />
    );
  }

  return (
    <div className="w-full py-4 flex flex-col gap-8 h-[100vw]">
      <Suspense fallback={<LoadingSpinner className="h-1/2 mt-20" />}>
        <Await resolve={sitePromise}>
          {(resolvedSiteData) => {
            if (!resolvedSiteData) {
              clearExactCacheEntry(`${cacheKeyPrefix.site_overview}${siteId}`);
              return <ErrorBoundary message="Failed to load link template" />;
            }
            return <SiteDetailsCard siteData={resolvedSiteData.data} />;
          }}
        </Await>
      </Suspense>
    </div>
  );
}
