import { CompanyDetailsWrapper } from "@/components/company/company-details-wrapper";
import CompanyRegistrationDetailsWrapper from "@/components/company/company-registration-details-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getCompanyById,
  getCompanyRegistrationDetailsByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import LoadingSpinner from "../../../components/loader";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const companyDetailsPromise = getCompanyById({
      supabase,
      id: companyId!,
    });

    const companyRegistrationDetailsPromise =
      getCompanyRegistrationDetailsByCompanyId({
        supabase,
        companyId,
      });

    return defer({
      companyDetailsPromise,
      companyRegistrationDetailsPromise,
      error: null,
    });
  } catch (error) {
    return defer({
      error,
      companyDetailsPromise: null,
      companyRegistrationDetailsPromise: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return await clientCaching(cacheKeyPrefix.general, args);
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
    return (
      <ErrorBoundary
        error={error}
        message="Something went wrong while loading the page."
      />
    );
  }

  return (
    <section key={resetKey}>
      <div className="flex flex-col gap-6 w-full lg:w-2/3 py-4">
        <Suspense fallback={<LoadingSpinner className={"h-[300px]"} />}>
          <Await resolve={companyDetailsPromise}>
            {(resolvedData) => {
              if (!resolvedData) {
                clearExactCacheEntry(cacheKeyPrefix.general);
                return (
                  <ErrorBoundary message="Failed to load company details" />
                );
              }
              return (
                <CompanyDetailsWrapper
                  data={resolvedData.data}
                  error={resolvedData.error}
                />
              );
            }}
          </Await>
        </Suspense>
      </div>

      <div className="flex flex-col gap-6 w-full lg:w-2/3 py-4">
        <Suspense fallback={<LoadingSpinner />}>
          <Await resolve={companyRegistrationDetailsPromise}>
            {(resolvedData) => {
              if (resolvedData?.error) {
                clearExactCacheEntry(cacheKeyPrefix.general);
                return (
                  <ErrorBoundary
                    error={resolvedData?.error}
                    message="Failed to load company registration details"
                  />
                );
              }
              return (
                <CompanyRegistrationDetailsWrapper
                  data={resolvedData?.data ?? null}
                  error={resolvedData?.error ?? null}
                />
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}
