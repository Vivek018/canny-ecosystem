import { CompanyDetailsWrapper } from "@/components/company/company-details-wrapper";
import CompanyRegistrationDetailsWrapper from "@/components/company/company-registration-details-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getCompanyById, getCompanyRegistrationDetailsByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, type ClientLoaderFunctionArgs, defer, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const companyDetailsPromise = getCompanyById({ supabase, id: companyId! });

    const companyRegistrationDetailsPromise =
      getCompanyRegistrationDetailsByCompanyId({ supabase, companyId });

    return defer({
      status: "success",
      message: "Company found",
      error: null,
      companyDetailsPromise,
      companyRegistrationDetailsPromise,
    });
  } catch (error) {
    return defer({
      status: "error",
      message: "Failed to get company",
      error,
      companyDetailsPromise: null,
      companyRegistrationDetailsPromise: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.general, args);
}

clientLoader.hydrate = true;

export default function SettingGeneral() {
  const { companyDetailsPromise, companyRegistrationDetailsPromise, error } =
    useLoaderData<typeof loader>();

  const [resetKey, setResetKey] = useState(Date.now());

  useEffect(() => {
    setResetKey(Date.now());
  }, [companyDetailsPromise, companyRegistrationDetailsPromise]);

  if (error) {
    clearExactCacheEntry(cacheKeyPrefix.general);
    return <ErrorBoundary error={error} message="Failed to load company details" />
  }

  return (
    <section key={resetKey}>
      <div className="flex flex-col gap-6 w-full lg:w-2/3 py-4">
        <Suspense fallback={<LoadingSpinner className="my-20" />}>
          <Await resolve={companyDetailsPromise}>
            {(resolvedData) => {
              if (!resolvedData) {
                clearExactCacheEntry(cacheKeyPrefix.general);
                return <ErrorBoundary message="Failed to load company details" />
              }
              return <CompanyDetailsWrapper data={resolvedData.data} error={resolvedData.error} />
            }}
          </Await>
        </Suspense>
      </div>

      <div className="flex flex-col gap-6 w-full lg:w-2/3 py-4">
        <Suspense fallback={<LoadingSpinner className="my-20" />}>
          <Await resolve={companyRegistrationDetailsPromise}>
            {(resolvedData) => {
              if (!resolvedData) {
                clearExactCacheEntry(cacheKeyPrefix.general);
                return <ErrorBoundary message="Failed to load company registration details" />
              }
              return <CompanyRegistrationDetailsWrapper data={resolvedData.data} error={resolvedData.error} />
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}
