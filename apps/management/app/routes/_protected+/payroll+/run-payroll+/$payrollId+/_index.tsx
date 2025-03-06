import { LoadingSpinner } from "@/components/loading-spinner";
import { PayrollComponent } from "@/components/payroll/payroll-component";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Await, defer, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return defer({});
}

export async function action({ request, params }: ActionFunctionArgs) {
  return defer({});
}

export default function PayrollId() {
  useLoaderData<typeof loader>();

  return (
    <Suspense fallback={<LoadingSpinner className="my-20" />}>
      <Await
        resolve={payrollDataPromise}
        errorElement={
          <div className="w-full p-4 text-center text-destructive">
            Error loading payroll data. Please try again later.
          </div>
        }
      >
        {(payrollEntries) => (
          <PayrollComponent data={payrollEntries} editable={true} />
        )}
      </Await>
    </Suspense>
  );
}
