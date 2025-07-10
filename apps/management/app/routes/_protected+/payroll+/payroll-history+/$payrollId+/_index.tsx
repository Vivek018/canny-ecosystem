import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ExitEntryComponent } from "@/components/payroll/exit-entry/exit-entry-component";
import { ReimbursementEntryComponent } from "@/components/payroll/reimbursement-entry/reimbursement-entry-component";

import { SalaryEntryComponent } from "@/components/payroll/salary-entry/salary-entry-component";
import { cacheKeyPrefix } from "@/constant";
import {
  clearCacheEntry,
  clearExactCacheEntry,
  clientCaching,
} from "@/utils/cache";
import { updatePayroll } from "@canny_ecosystem/supabase/mutations";
import {
  type ExitsPayrollEntriesWithEmployee,
  getExitsEntriesForPayrollByPayrollId,
  getGroupsBySiteId,
  getPayrollById,
  getReimbursementEntriesForPayrollByPayrollId,
  getSalaryEntriesByPayrollId,
  getSitesByProjectId,
  type ReimbursementPayrollEntriesWithEmployee,
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

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const site = searchParams.get("site")?.split(",") ?? [];
    const group = searchParams.get("group")?.split(",") ?? [];

    const { data: payrollData, error } = await getPayrollById({
      supabase,
      payrollId: payrollId ?? "",
    });
    if (error || !payrollData) {
      clearExactCacheEntry(`${cacheKeyPrefix.payroll_history_id}${payrollId}`);
    }

    const salaryEntriesPromise = getSalaryEntriesByPayrollId({
      supabase,
      payrollId: payrollId ?? "",
      params: {
        site,
        group,
      },
    });
    const reimbursementEntriesPromise =
      getReimbursementEntriesForPayrollByPayrollId({
        supabase,
        payrollId: payrollId ?? "",
      });
    const exitEntriesPromise = getExitsEntriesForPayrollByPayrollId({
      supabase,
      payrollId: payrollId ?? "",
    });

    let groupOptions: any = [];
    let siteOptions: any = [];

    if (payrollData?.project_id) {
      const { data: allSites } = await getSitesByProjectId({
        projectId: payrollData?.project_id,
        supabase,
      });
      siteOptions = allSites?.map((sites) => ({
        label: sites?.name,
        value: sites?.id,
      }));
    }
    if (payrollData?.project_site_id) {
      const { data: allGroups } = await getGroupsBySiteId({
        siteId: payrollData?.project_site_id,
        supabase,
      });
      groupOptions = allGroups?.map((sites) => ({
        label: sites?.name,
        value: sites?.id,
      }));
    }

    return defer({
      payrollData,
      salaryEntriesPromise,
      reimbursementEntriesPromise,
      groupOptions,
      siteOptions,
      exitEntriesPromise,
      error: null,
      env,
    });
  } catch (error) {
    console.error("Payroll Id Index Error", error);
    return defer({
      payrollData: null,

      salaryEntriesPromise: Promise.resolve({ data: null, error: null }),
      reimbursementEntriesPromise: Promise.resolve({ data: null, error: null }),
      groupOptions: [],
      siteOptions: [],
      exitEntriesPromise: Promise.resolve({
        data: null,
        error: null,
      }),

      error,
      env: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.payroll_history_id}${
      args.params.payrollId
    }${url.searchParams.toString()}`,
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

    const data = {
      id: (parsedData.id ?? payrollId) as PayrollDatabaseRow["id"],
      status: parsedData.status as PayrollDatabaseRow["status"],
      run_date: new Date().toISOString() as PayrollDatabaseRow["run_date"],
      total_employees:
        parsedData.total_employees as PayrollDatabaseRow["total_employees"],
      total_net_amount:
        parsedData.total_net_amount as PayrollDatabaseRow["total_net_amount"],
    };

    const { status, error } = await updatePayroll({ supabase, data });
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

export default function HistoryPayrollId() {
  const {
    payrollData,
    salaryEntriesPromise,
    reimbursementEntriesPromise,
    exitEntriesPromise,
    groupOptions,
    siteOptions,
    env,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const revalidator = useRevalidator();
  const { payrollId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.run_payroll);
        clearExactCacheEntry(
          `${cacheKeyPrefix.payroll_history_id}${payrollId}`
        );
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

  if (!payrollData) {
    clearCacheEntry(`${cacheKeyPrefix.payroll_history_id}${payrollId}`);
    return (
      <ErrorBoundary
        error={null}
        message="Failed to load Payroll Data in Payroll History Id"
      />
    );
  }
  return (
    <Suspense fallback={<LoadingSpinner className="my-20" />}>
      {payrollData.payroll_type === "reimbursement" ||
      payrollData.payroll_type === "exit" ? (
        <Await
          resolve={
            payrollData.payroll_type === "reimbursement"
              ? reimbursementEntriesPromise
              : exitEntriesPromise
          }
        >
          {({ data, error }) => {
            if (error || !data) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.payroll_history_id}${payrollId}`
              );
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load Payroll Entries in Payroll History"
                />
              );
            }

            return payrollData.payroll_type === "reimbursement" ? (
              <ReimbursementEntryComponent
                payrollData={payrollData as any}
                data={
                  data as unknown as ReimbursementPayrollEntriesWithEmployee[]
                }
                noButtons={true}
                env={env as SupabaseEnv}
                fromWhere="payrollhistory"
              />
            ) : (
              <ExitEntryComponent
                payrollData={payrollData as any}
                data={data as unknown as ExitsPayrollEntriesWithEmployee[]}
                noButtons={true}
                env={env as SupabaseEnv}
                fromWhere="payrollhistory"
              />
            );
          }}
        </Await>
      ) : payrollData.payroll_type === "salary" ? (
        <Await resolve={salaryEntriesPromise}>
          {({ data, error }) => {
            if (error || !data) {
              clearExactCacheEntry(
                `${cacheKeyPrefix.payroll_history_id}${payrollId}`
              );
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load Salary Entries in Payroll Histrory"
                />
              );
            }

            return (
              <SalaryEntryComponent
                payrollData={payrollData as any}
                data={data as any}
                noButtons={true}
                env={env as SupabaseEnv}
                fromWhere="payrollhistory"
                groupOptions={groupOptions}
                siteOptions={siteOptions}
              />
            );
          }}
        </Await>
      ) : null}
    </Suspense>
  );
}
