import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getLabourWelfareFundsByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, defer, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/react";
import { Suspense } from "react";
import { LWFWrapper } from "@/components/statutory-fields/labour-welfare-fund/lwf-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const labourWelfareFundPromise = getLabourWelfareFundsByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      labourWelfareFundPromise,
      error: null,
    });
  } catch (error) {
    return json(
      {
        labourWelfareFundPromise: null,
        error,
      },
      { status: 500 },
    );
  }
}

export default function LabourWelfareFundIndex() {
  const { labourWelfareFundPromise, error } = useLoaderData<typeof loader>();

  if (error)
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load labour welfare funds"
      />
    );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={labourWelfareFundPromise}>
        {(resolvedData) => {
          if (!resolvedData) {
            return (
              <ErrorBoundary message="Failed to load labour welfare funds" />
            )
          }
          return (
            <LWFWrapper data={resolvedData.data} error={resolvedData.error} />
          );
        }}
      </Await>
    </Suspense>
  );
}
