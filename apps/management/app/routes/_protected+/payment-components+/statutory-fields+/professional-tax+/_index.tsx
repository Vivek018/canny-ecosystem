import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getProfessionalTaxesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/react";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ProfessionalTaxWrapper } from "@/components/statutory-fields/professional-tax/professional-tax-wrapper";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const professionTaxPromise = getProfessionalTaxesByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      professionTaxPromise,
      error: null,
    });
  } catch (error) {
    return json({
      professionTaxPromise: null,
      error,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(cacheKeyPrefix.professional_tax, args);
}

export default function ProfessionalTaxIndex() {
  const { professionTaxPromise, error } = useLoaderData<typeof loader>();

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.professional_tax);
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load Professional Taxes"
      />
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={professionTaxPromise}>
        {(resolvedData) => {
          if (!resolvedData) {
            clearExactCacheEntry(cacheKeyPrefix.professional_tax);
            return (
              <ErrorBoundary message="Failed to load Professional Taxes" />
            );
          }
          return (
            <ProfessionalTaxWrapper
              data={resolvedData.data}
              error={resolvedData.error}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}
