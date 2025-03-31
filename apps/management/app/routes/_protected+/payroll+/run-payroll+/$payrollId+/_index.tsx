import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PayrollEntryComponent } from "@/components/payroll/payroll-entry-component";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { updatePayroll } from "@canny_ecosystem/supabase/mutations";
import {
  getPayrollById,
  getPayrollEntriesByPayrollId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type {
  PayrollDatabaseRow,
  SupabaseEnv,
} from "@canny_ecosystem/supabase/types";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { isGoodStatus } from "@canny_ecosystem/utils";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  json,
  useActionData,
  useLoaderData,
  useParams,
  useRevalidator,
} from "@remix-run/react";
import { Suspense, useEffect } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const payrollId = params.payrollId;
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
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
    return defer({ payrollPromise, payrollEntriesPromise, env, error: null });
  } catch (error) {
    console.error("Payroll Id Index Error", error);
    return defer({
      payrollPromise: Promise.resolve({ data: null, error: null }),
      payrollEntriesPromise: Promise.resolve({ data: null, error: null }),
      error,
      env: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    `${cacheKeyPrefix.run_payroll_id}${args.params.payrollId}`,
    args
  );
}

clientLoader.hydrate = true;

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const formData = await request.formData();
    const payrollId = params.payrollId;
    const parsedData = JSON.parse(formData.get("data") as string);
    const parsedSkipPayrollEntries = JSON.parse(
      formData.get("skipPayrollEntries") as string
    );

    const data = {
      id: (parsedData.id ?? payrollId) as PayrollDatabaseRow["id"],
      status: parsedData.status as PayrollDatabaseRow["status"],
      run_date: new Date().toISOString() as PayrollDatabaseRow["run_date"],
      total_employees:
        parsedData.total_employees as PayrollDatabaseRow["total_employees"],
      total_net_amount:
        parsedData.total_net_amount as PayrollDatabaseRow["total_net_amount"],
    };

    const { status, error } = await updatePayroll({
      supabase,
      data,
      skipPayrollEntries: parsedSkipPayrollEntries,
    });
    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Payroll updated successfully",
        error: null,
      });
    }
    return json(
      { status: "error", message: "Payroll update failed", error },
      { status: 500 }
    );
  } catch (error) {
    console.error("Payroll Id Action error", error);
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error,
        data: null,
      },
      { status: 500 }
    );
  }
}

export default function RunPayrollId() {
  const { payrollPromise, payrollEntriesPromise, env } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const revalidator = useRevalidator();
  const { payrollId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.run_payroll);
        clearExactCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
        clearExactCacheEntry(cacheKeyPrefix.payroll_history);
        toast({
          title: "Success",
          description: actionData?.message || "Payroll updated",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description:
            actionData?.error || actionData?.message || "Payroll update failed",
          variant: "destructive",
        });
      }
      revalidator.revalidate();
    }
  }, [actionData]);

  return (
    <Suspense fallback={<LoadingSpinner className="my-20" />}>
      <Await resolve={payrollPromise}>
        {({ data: payrollData, error: payrollError }) => {
          if (payrollError || !payrollData) {
            clearExactCacheEntry(
              `${cacheKeyPrefix.run_payroll_id}${payrollId}`
            );
            return (
              <ErrorBoundary
                error={payrollError}
                message="Failed to load Payroll Data in Run Payroll Id"
              />
            );
          }
          return (
            <Await resolve={payrollEntriesPromise}>
              {({ data, error }) => {
                if (error || !data) {
                  clearExactCacheEntry(
                    `${cacheKeyPrefix.run_payroll_id}${payrollId}`
                  );
                  return (
                    <ErrorBoundary
                      error={error}
                      message="Failed to load Payroll Entries in Run Payroll"
                    />
                  );
                }

                if (
                  payrollData.payroll_type === "reimbursement" ||
                  payrollData.payroll_type === "exit"
                )
                  return (
                    <PayrollEntryComponent
                      payrollData={payrollData}
                      data={data}
                      env={env as unknown as SupabaseEnv}
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
