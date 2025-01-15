import { ErrorBoundary } from "@/components/error-boundary";
import { EPFWrapper } from "@/components/statutory-fields/employee-provident-fund/epf-wrapper";
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

export type LoaderData = Awaited<ReturnType<typeof loader>>["data"];

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const cacheKey = "employee-provident-fund";
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    const parsedData = JSON.parse(cachedData) as LoaderData | null;
    if (parsedData) {
      return parsedData;
    }
  }

  const serverData = (await serverLoader()) as LoaderData;
  const resolvedData: Record<string, unknown> = {};

  for (const [key, promise] of Object.entries(serverData)) {
    try {
      resolvedData[key] = await promise;
    } catch {
      resolvedData[key] = null;
    }
  }
  sessionStorage.setItem(cacheKey, JSON.stringify(resolvedData));

  return resolvedData;
}

clientLoader.hydrate = true;

export default function EmployeeProvidentFundIndex() {
  const { epfPromise, error } = useLoaderData<typeof loader>();

  if (error)
    return <ErrorBoundary error={error} message='Failed to load data' />;

  return (
    <div className='p-4 flex gap-3 place-content-center justify-between'>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={epfPromise}>
          {(resolvedData) => {
            if (!resolvedData)
              return <ErrorBoundary message='Failed to load data' />;
            return (
              <EPFWrapper data={resolvedData.data} error={resolvedData.error} />
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
