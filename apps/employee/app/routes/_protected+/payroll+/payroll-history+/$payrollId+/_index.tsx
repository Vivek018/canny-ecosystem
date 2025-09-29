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
import {
  getLocationsByCompanyId,
  getPayrollById,
  getSalaryEntriesByPayrollId,
  getSiteNamesByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { SupabaseEnv } from "@canny_ecosystem/supabase/types";
import { defaultMonth, defaultYear } from "@canny_ecosystem/utils";

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

    const allSiteOptions = allSiteData?.map((siteData) => ({
      label: siteData.name?.toLowerCase(),
      value: siteData.id,
      pseudoLabel: siteData?.projects?.name,
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
      month: payrollData?.month ?? defaultMonth,
      year: payrollData?.year ?? defaultYear,
    });

    return defer({
      payrollData,
      salaryEntriesPromise,
      allSiteOptions,
      allLocationOptions,
      error: null,
      env,
    });
  } catch (error) {
    console.error("Payroll Id Index Error", error);
    return defer({
      payrollData: null,
      salaryEntriesPromise: Promise.resolve({ data: null, error: null }),
      allSiteOptions: [],
      allLocationOptions: [],
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

export default function HistoryPayrollId() {
  const {
    payrollData,
    salaryEntriesPromise,
    env,
    allSiteOptions,
    allLocationOptions,
  } = useLoaderData<typeof loader>();

  const { payrollId } = useParams();

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
              env={env as SupabaseEnv}
              fromWhere="payrollhistory"
              allLocationOptions={allLocationOptions ?? []}
              allSiteOptions={allSiteOptions ?? []}
            />
          );
        }}
      </Await>
    </Suspense>
  );
}
