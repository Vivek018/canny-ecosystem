import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";

import { SalaryEntryComponent } from "@/components/payroll/salary-entry/salary-entry-component";
import { cacheKeyPrefix } from "@/constant";
import {
  clearCacheEntry,
  clearExactCacheEntry,
  clientCaching,
} from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { updatePayroll } from "@canny_ecosystem/supabase/mutations";
import {
  getDepartmentsByCompanyId,
  getEmployeeProvidentFundForEpfChallanByCompanyId,
  getLocationsByCompanyId,
  getPayrollById,
  getProjectNamesByCompanyId,
  getSalaryEntriesByPayrollId,
  getSiteNamesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type {
  EmployeeProvidentFundDatabaseRow,
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
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  try {
    const { data: allSiteData, error: siteError } =
      await getSiteNamesByCompanyId({
        supabase,
        companyId,
      });
    if (siteError) throw siteError;

    const { data: allProjectData, error: projectError } =
      await getProjectNamesByCompanyId({
        supabase,
        companyId,
      });
    if (projectError) throw projectError;

    const allProjectOptions = allProjectData?.map((projectData) => ({
      label: projectData.name?.toLowerCase(),
      value: projectData.id,
    }));
    const allSiteOptions = allSiteData?.map((siteData) => ({
      label: siteData.name?.toLowerCase(),
      value: siteData.id,
      pseudoLabel: siteData?.projects?.name,
    }));

    const { data: allDepartmentData, error: departmentError } =
      await getDepartmentsByCompanyId({
        supabase,
        companyId,
      });
    if (departmentError) throw departmentError;

    const allDepartmentOptions = allDepartmentData?.map((departmentData) => ({
      label: departmentData.name?.toLowerCase(),
      value: departmentData.id,
      pseudoLabel: departmentData?.site?.name,
    }));

    const { data: allLocationData, error: locationError } =
      await getLocationsByCompanyId({
        supabase,
        companyId,
      });
    if (locationError) throw locationError;

    const allLocationOptions = allLocationData?.map((locationData) => ({
      label: locationData.name?.toLowerCase(),
      value: locationData.id,
    }));

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
    });

    const { data: epfData } =
      await getEmployeeProvidentFundForEpfChallanByCompanyId({
        companyId,
        supabase,
      });

    return defer({
      payrollData,
      salaryEntriesPromise,
      allSiteOptions,
      allDepartmentOptions,
      allLocationOptions,
      allProjectOptions,
      epfData,
      error: null,
      env,
    });
  } catch (error) {
    console.error("Payroll Id Index Error", error);
    return defer({
      payrollData: null,
      salaryEntriesPromise: Promise.resolve({ data: null, error: null }),
      allSiteOptions: [],
      allDepartmentOptions: [],
      allLocationOptions: [],
      allProjectOptions: [],
      epfData: [],
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
    args,
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
      { status: 500 },
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
      { status: 500 },
    );
  }
}

export default function HistoryPayrollId() {
  const {
    payrollData,
    salaryEntriesPromise,
    env,
    allSiteOptions,
    allDepartmentOptions,
    allProjectOptions,
    allLocationOptions,
    epfData,
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
          `${cacheKeyPrefix.payroll_history_id}${payrollId}`,
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
            (actionData?.error as any)?.message ||
            actionData?.message ||
            "Payroll update failed",
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
      <Await resolve={salaryEntriesPromise}>
        {({ data, error }) => {
          if (error || !data) {
            clearExactCacheEntry(
              `${cacheKeyPrefix.payroll_history_id}${payrollId}`,
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
              epfData={epfData as unknown as EmployeeProvidentFundDatabaseRow}
              fromWhere="payrollhistory"
              allLocationOptions={allLocationOptions ?? []}
              allSiteOptions={allSiteOptions ?? []}
              allDepartmentOptions={allDepartmentOptions ?? []}
              allProjectOptions={allProjectOptions ?? []}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}
