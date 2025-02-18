import { ExitsCard } from "@/components/employees/exits/exits-card";
import { LinkTemplateCard } from "@/components/employees/link-template/link-template-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getExitByEmployeeId, getPaymentTemplateAssignmentByEmployeeId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await, type ClientLoaderFunctionArgs, useLoaderData, useParams,
} from "@remix-run/react";
import {  Suspense } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const employeeId = params.employeeId as string;

  try {
    const paymentTemplateAssignmentPromise = getPaymentTemplateAssignmentByEmployeeId({
      supabase, employeeId,
    });
    const exitsPromise = getExitByEmployeeId({ supabase, employeeId });

    return defer({ paymentTemplateAssignmentPromise, exitsPromise, error: null });
  } catch (error) {
    return defer({ error, paymentTemplateAssignmentPromise: null, exitsPromise: null });
  }
}

// caching
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(`${cacheKeyPrefix.payments}${args.params.employeeId}`, args);
}
clientLoader.hydrate = true;

export default function Payments() {
  const { paymentTemplateAssignmentPromise, exitsPromise, error } = useLoaderData<typeof loader>();
  const { employeeId } = useParams();

  if (error) {
    clearExactCacheEntry(`${cacheKeyPrefix.employee_work_portfolio}${employeeId}`);
    return <ErrorBoundary error={error} message="Failed to load data" />;
  }

  return (
    <div className="w-full py-4 flex flex-col gap-8">
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={paymentTemplateAssignmentPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(`${cacheKeyPrefix.payments}${employeeId}`);
              return <ErrorBoundary message="Failed to load link template" />;
            }

            return <LinkTemplateCard paymentTemplateAssignmentData={resolvedData.data as any} />
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={exitsPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(`${cacheKeyPrefix.payments}${employeeId}`);
              return <ErrorBoundary message="Failed to load link template" />;
            }
            return <ExitsCard exitsData={resolvedData.data as any} employeeId={employeeId as string} />
          }}
        </Await>
      </Suspense>
    </div>
  );
}