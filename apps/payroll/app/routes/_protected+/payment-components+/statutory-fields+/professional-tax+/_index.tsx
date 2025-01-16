import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getProfessionalTaxesByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, type ClientLoaderFunctionArgs, defer, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ProfessionalTaxWrapper } from "@/components/statutory-fields/professional-tax/professional-tax-wrapper";
import { cacheDeferDataInSession } from "@/utils/cache";

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
    return defer({
      professionTaxPromise: null,
      error,
    });
  }
}

export type LoaderData = Awaited<ReturnType<typeof loader>>["data"];

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const cacheKey = "professional-tax";
  return cacheDeferDataInSession<LoaderData>(cacheKey, args);
}

clientLoader.hydrate = true;


export default function ProfessionalTaxIndex() {
  const { professionTaxPromise, error } = useLoaderData<typeof loader>();

  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load Professional Taxes"
      />
    );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={professionTaxPromise}>
        {(resolvedData) => {
          if (!resolvedData)
            return (
              <ErrorBoundary message="Failed to load Professional Taxes" />
            );
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
