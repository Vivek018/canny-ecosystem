import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PayrollEntryComponent } from "@/components/payroll/payroll-entry-component";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import {
  getPayrollById,
  getPayrollEntriesByPayrollId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const payrollId = params.payrollId;
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const payrollPromise = getPayrollById({
      supabase,
      payrollId: payrollId ?? "",
    });
    const payrollEntriesPromise = getPayrollEntriesByPayrollId({
      supabase,
      payrollId: payrollId ?? "",
    });
    return defer({ payrollPromise, payrollEntriesPromise, error: null });
  } catch (error) {
    console.error("Payroll History Id Index Error", error);
    return defer({
      payrollPromise: Promise.resolve({ data: null, error: null }),
      payrollEntriesPromise: Promise.resolve({ data: null, error: null }),
      error,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    `${cacheKeyPrefix.payroll_history_id}${args.params.payrollId}`,
    args,
  );
}
clientLoader.hydrate = true;

export default function PayrollId() {
  const { payrollPromise, payrollEntriesPromise } =
    useLoaderData<typeof loader>();
  const { payrollId } = useParams();

  return (
    <Suspense fallback={<LoadingSpinner className="my-20" />}>
      <Await resolve={payrollPromise}>
        {({ data: payrollData, error: payrollError }) => {
          if (payrollError || !payrollData) {
            clearExactCacheEntry(`${cacheKeyPrefix.payroll_history_id}${payrollId}`);
            return (
              <ErrorBoundary
                error={payrollError}
                message="Failed to load Payroll Data in History Id"
              />
            );
          }
          return (
            <Await resolve={payrollEntriesPromise}>
              {({ data, error }) => {
                if (error || !data) {
                  clearExactCacheEntry(`${cacheKeyPrefix.payroll_history_id}${payrollId}`);
                  return (
                    <ErrorBoundary
                      error={error}
                      message="Failed to load Payroll Entries in Payroll History"
                    />
                  );
                }
                if (payrollData.payroll_type === "reimbursement" || payrollData.payroll_type === "exit")
                  return (
                    <PayrollEntryComponent payrollData={payrollData} data={data} noButtons={true} />
                  );
              }}
            </Await>
          );
        }}
      </Await>
    </Suspense>
  );
}
