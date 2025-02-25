import { ExitsCard } from "@/components/employees/exits/exits-card";
import { LinkTemplateCard } from "@/components/employees/link-template/link-template-card";
import { ErrorBoundary } from "@/components/error-boundary";
import LoadingSpinner from "@/components/loading-spinner";
import { PaymentTemplateComponentsCard } from "@/components/payment-templates/payment-template-components-card";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import {
  getExitByEmployeeId,
  getPaymentTemplateAssignmentByEmployeeId,
  getPaymentTemplateComponentsByTemplateId,
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
  const { supabase } = getSupabaseWithHeaders({ request });
  const employeeId = params.employeeId as string;

  try {
    const paymentTemplateAssignmentPromise =
      getPaymentTemplateAssignmentByEmployeeId({
        supabase,
        employeeId,
      });
    const paymentTemplateComponentsPromise =
      paymentTemplateAssignmentPromise.then((assignmentResult) => {
        if (assignmentResult.data?.template_id) {
          return getPaymentTemplateComponentsByTemplateId({
            supabase,
            templateId: assignmentResult.data.template_id,
          });
        }
        return { data: null, error: null };
      });
    const exitsPromise = getExitByEmployeeId({ supabase, employeeId });

    return defer({
      paymentTemplateAssignmentPromise,
      paymentTemplateComponentsPromise,
      exitsPromise,
      error: null,
    });
  } catch (error) {
    return defer({
      error,
      paymentTemplateAssignmentPromise: null,
      paymentTemplateComponentsPromise: null,
      exitsPromise: null,
    });
  }
}

// caching
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    `${cacheKeyPrefix.employee_payments}${args.params.employeeId}`,
    args,
  );
}
clientLoader.hydrate = true;

export default function Payments() {
  const {
    paymentTemplateAssignmentPromise,
    paymentTemplateComponentsPromise,
    exitsPromise,
    error,
  } = useLoaderData<typeof loader>();
  const { employeeId } = useParams();

  if (error) {
    clearExactCacheEntry(`${cacheKeyPrefix.employee_payments}${employeeId}`);
    return <ErrorBoundary error={error} message="Failed to load data" />;
  }

  return (
    <div className="w-full py-4 flex flex-col gap-8">
      <Suspense fallback={<LoadingSpinner className="h-1/4" />}>
        <Await resolve={paymentTemplateAssignmentPromise}>
          {(resolvedAssignment) => {
            if (!resolvedAssignment) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.employee_payments}${employeeId}`,
              );
              return <ErrorBoundary message="Failed to load link template" />;
            }

            return (
              <Await resolve={paymentTemplateComponentsPromise}>
                {(resolvedPaymentTemplateComponents) => (
                  <>
                    <LinkTemplateCard
                      paymentTemplateAssignmentData={resolvedAssignment?.data}
                    />
                    <PaymentTemplateComponentsCard
                      paymentTemplateComponents={
                        resolvedPaymentTemplateComponents?.data
                      }
                      returnTo={`/employees/${employeeId}/payments`}
                    />
                  </>
                )}
              </Await>
            );
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<LoadingSpinner className="h-1/4" />}>
        <Await resolve={exitsPromise}>
          {(resolvedData) => {
            if (!resolvedData) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.employee_payments}${employeeId}`,
              );
              return <ErrorBoundary message="Failed to load link template" />;
            }
            return (
              <ExitsCard
                exitsData={resolvedData.data}
                employeeId={employeeId ?? ""}
              />
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
