import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PayrollComponent } from "@/components/payroll/payroll-component";
import { getPayrollEntriesByPayrollId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Await, defer, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const payrollId = params.payrollId;
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const payrollEntriesPromise = getPayrollEntriesByPayrollId({
      supabase,
      payrollId: payrollId ?? "",
    });
    return defer({ payrollEntriesPromise });
  } catch (error) {
    console.error("Payroll Id Index Error", error);
    return defer({
      payrollEntriesPromise: Promise.resolve({ data: [], error: null }),
      error,
    });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  return defer({});
}

export default function PayrollId() {
  const { payrollEntriesPromise } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<LoadingSpinner className="my-20" />}>
      <Await resolve={payrollEntriesPromise}>
        {({ data, error }) => {
          if (error || !data) {
            return (
              <ErrorBoundary
                error={error}
                message="Failed to load Payroll Entries"
              />
            );
          }
          return <PayrollComponent data={data} editable={true} />;
        }}
      </Await>
    </Suspense>
  );
}
