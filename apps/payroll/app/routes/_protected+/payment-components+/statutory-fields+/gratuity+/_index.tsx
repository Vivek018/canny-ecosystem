import { ErrorBoundary } from "@/components/error-boundary";
import { GratuityWrapper } from "@/components/statutory-fields/gratuity/gratuity-wrapper";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getGratuityByCompanyId } from "@canny_ecosystem/supabase/queries";
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
    const gratuityPromise = getGratuityByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      gratuityPromise,
      error: null,
    });
  } catch (error) {
    return defer(
      {
        error,
        gratuityPromise: null,
      },
      { status: 500 }
    );
  }
}

export type LoaderData = Awaited<ReturnType<typeof loader>>["data"];


export default function GratuityIndex() {
  const { gratuityPromise, error } = useLoaderData<typeof loader>();

  if (error)
    return <ErrorBoundary error={error} message='Failed to load Gratuity' />;

  return (
    <div className='p-4 flex gap-3 place-content-center justify-between'>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={gratuityPromise}>
          {(resolvedData) => {
            if (!resolvedData)
              return <ErrorBoundary message='Failed to load gratuity' />;
            return (
              <GratuityWrapper
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
