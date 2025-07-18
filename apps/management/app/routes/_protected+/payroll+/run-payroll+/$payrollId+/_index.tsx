import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ImportDepartmentSalaryPayrollModal } from "@/components/payroll/import-export/import-department-salary-modal-payroll";

import { SalaryEntryComponent } from "@/components/payroll/salary-entry/salary-entry-component";
import { cacheKeyPrefix } from "@/constant";
import {
  clearCacheEntry,
  clearExactCacheEntry,
  clientCaching,
} from "@/utils/cache";
import { updatePayroll } from "@canny_ecosystem/supabase/mutations";
import {
  getDepartmentsBySiteId,
  getPayrollById,
  getSalaryEntriesByPayrollId,
  getSitesByProjectId,
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
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
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

    const { data: payrollData } = await getPayrollById({
      supabase,
      payrollId: payrollId ?? "",
    });

    let departmentOptions: any = [];
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
      const { data: allDepartments } = await getDepartmentsBySiteId({
        siteId: payrollData?.project_site_id,
        supabase,
      });
      departmentOptions = allDepartments?.map((sites) => ({
        label: sites?.name,
        value: sites?.id,
      }));
    }

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    let site = searchParams.get("site")?.split(",") ?? [];
    let department = searchParams.get("department")?.split(",") ?? [];

    let shouldRedirect = false;
    if (
      site.length === 0 &&
      payrollData?.project_id &&
      siteOptions.length > 0
    ) {
      site = [siteOptions[0].value];
      searchParams.set("site", site.join(","));
      shouldRedirect = true;
    }

    if (
      department.length === 0 &&
      payrollData?.project_site_id &&
      departmentOptions.length > 0
    ) {
      department = [departmentOptions[0].value];
      searchParams.set("department", department.join(","));
      shouldRedirect = true;
    }
    if (shouldRedirect) {
      return redirect(`${url.pathname}?${searchParams.toString()}`);
    }

    const salaryEntriesPromise = getSalaryEntriesByPayrollId({
      supabase,
      payrollId: payrollId ?? "",
      params: {
        site,
        department,
      },
    });

    return defer({
      payrollData,
      salaryEntriesPromise,
      departmentOptions,
      siteOptions,
      error: null,
      env,
    });
  } catch (error) {
    console.error("Payroll Id Index Error", error);
    return defer({
      payrollData: null,
      salaryEntriesPromise: Promise.resolve({ data: null, error: null }),
      departmentOptions: [],
      siteOptions: [],
      error,
      env: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.run_payroll_id}${
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
    const redirectUrl =
      (formData.get("redirectUrl") as string) ??
      `/payroll/run-payroll/${payrollId}`;

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
    });
    if (isGoodStatus(status)) {
      return json({
        status: "success",
        message: "Payroll updated successfully",
        redirectUrl,
        error: null,
      });
    }
    return json(
      { status: "error", message: "Payroll update failed", redirectUrl, error },
      { status: 500 }
    );
  } catch (error) {
    console.error("Payroll Id Action error", error);
    return json(
      {
        status: "error",
        message: "An unexpected error occurred",
        redirectUrl: `/payroll/run-payroll/${params.payrollId}`,
        error,
        data: null,
      },
      { status: 500 }
    );
  }
}

export default function RunPayrollId() {
  const {
    payrollData,
    salaryEntriesPromise,
    departmentOptions,
    siteOptions,
    env,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { payrollId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    if (actionData) {
      if (actionData?.status === "success") {
        clearExactCacheEntry(cacheKeyPrefix.run_payroll);
        clearCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
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
      navigate(actionData.redirectUrl, { replace: true });
    }
  }, [actionData]);

  if (!payrollData) {
    clearCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
    return (
      <ErrorBoundary
        error={null}
        message="Failed to load Payroll Data in Run Payroll Id"
      />
    );
  }

  return (
    <>
      <Suspense fallback={<LoadingSpinner className="my-20" />}>
        <Await resolve={salaryEntriesPromise}>
          {({ data, error }) => {
            if (error || !data) {
              clearCacheEntry(`${cacheKeyPrefix.run_payroll_id}${payrollId}`);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load Salary Entries in Run Payroll"
                />
              );
            }

            return (
              <SalaryEntryComponent
                payrollData={payrollData as any}
                data={data as any}
                env={env as SupabaseEnv}
                fromWhere="runpayroll"
                siteOptions={siteOptions}
                departmentOptions={departmentOptions}
              />
            );
          }}
        </Await>
      </Suspense>
      <ImportDepartmentSalaryPayrollModal />
    </>
  );
}
