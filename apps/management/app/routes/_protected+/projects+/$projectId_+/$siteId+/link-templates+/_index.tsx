import { ErrorBoundary } from "@/components/error-boundary";
import { SiteLinkedTemplates } from "@/components/sites/link-templates/site-linked-templates";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getPaymentTemplateAssignmentsBySiteId,
  getPaymentTemplatesByCompanyId,
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

export async function loader({ request, params }: LoaderFunctionArgs) {
  const siteId = params.siteId as string;
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {
    const paymentTemplatesPromise = getPaymentTemplatesByCompanyId({
      supabase,
      companyId,
    });
    const paymentTemplateAssignmentsPromise =
      getPaymentTemplateAssignmentsBySiteId({ supabase, siteId });
    return defer({
      paymentTemplatesPromise,
      paymentTemplateAssignmentsPromise,
      error: null,
    });
  } catch (error) {
    return defer(
      {
        paymentTemplatesPromise: null,
        paymentTemplateAssignmentsPromise: null,
        error,
      },
      { status: 500 }
    );
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(
    `${cacheKeyPrefix.site_link_templates}${args.params.siteId}`,
    args
  );
}

clientLoader.hydrate = true;

export default function LinkTemplate() {
  const { paymentTemplatesPromise, paymentTemplateAssignmentsPromise } =
    useLoaderData<typeof loader>();

  const { siteId } = useParams();

  return (
    <div className='w-full py-4 flex flex-col gap-8'>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={paymentTemplatesPromise}>
          {(resolvedPaymentTemplates) => {
            if (!resolvedPaymentTemplates) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.site_link_templates}${siteId}`
              );
              return <ErrorBoundary message='Failed to load link template' />;
            }
            return (
              <Await resolve={paymentTemplateAssignmentsPromise}>
                {(resolvedPaymentTemplateAssignments) => {
                  const linkTemplates =
                    resolvedPaymentTemplateAssignments?.data;
                  return (
                    <SiteLinkedTemplates linkedTemplates={linkTemplates} />
                  );
                }}
              </Await>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
