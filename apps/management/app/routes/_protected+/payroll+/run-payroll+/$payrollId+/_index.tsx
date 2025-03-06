import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PayrollComponent } from "@/components/payroll/payroll-component";
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
    console.error("Payroll Id Index Error", error);
    return defer({
      payrollPromise: Promise.resolve({ data: null, error: null }),
      payrollEntriesPromise: Promise.resolve({ data: null, error: null }),
      error,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.run_payroll_id, args);
}

clientLoader.hydrate = true;

export default function PayrollId() {
  const { payrollPromise, payrollEntriesPromise } =
    useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<LoadingSpinner className="my-20" />}>
      <Await resolve={payrollPromise}>
        {({ data: payrollData, error: payrollError }) => {
          if (payrollError || !payrollData) {
            clearExactCacheEntry(cacheKeyPrefix.run_payroll_id);
            return (
              <ErrorBoundary
                error={payrollError}
                message="Failed to load Payroll Data in Id"
              />
            );
          }
          return (
            <Await resolve={payrollEntriesPromise}>
              {({ data, error }) => {
                if (error || !data) {
                  clearExactCacheEntry(cacheKeyPrefix.run_payroll_id);
                  return (
                    <ErrorBoundary
                      error={error}
                      message="Failed to load Payroll Entries"
                    />
                  );
                }
                return (
                  <PayrollComponent
                    payrollData={payrollData}
                    data={data}
                    editable={true}
                  />
                );
              }}
            </Await>
          );
        }}
      </Await>
    </Suspense>
  );
}
