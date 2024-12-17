import { CompanyDetailsWrapper } from "@/components/company/company-details-wrapper";
import CompanyRegistrationDetailsWrapper from "@/components/company/company-registration-details-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getCompanyById,
  getCompanyRegistrationDetailsByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, defer, json, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

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
      status: "success",
      message: "Company found",
      error: null,
      companyDetailsPromise,
      companyRegistrationDetailsPromise,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "Failed to get company",
      error,
      companyDetailsPromise: null,
      companyRegistrationDetailsPromise: null,
    });
  }
}

export default function SettingGeneral() {
  const { companyDetailsPromise, companyRegistrationDetailsPromise, error } =
    useLoaderData<typeof loader>();

  if (error) {
    return (
      <ErrorBoundary error={error} message="Failed to load company details" />
    );
  }

  return (
    <>
      <section className="flex flex-col gap-6 w-full lg:w-2/3 my-4">
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={companyDetailsPromise}>
            {(resolvedData) => {
              if (!resolvedData)
                return (
                  <ErrorBoundary message="Failed to load company details" />
                );
              return (
                <CompanyDetailsWrapper
                  data={resolvedData.data}
                  error={resolvedData.error}
                />
              );
            }}
          </Await>
        </Suspense>
      </section>

      <section className="flex flex-col gap-6 w-full lg:w-2/3 my-4">
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={companyRegistrationDetailsPromise}>
            {(resolvedData) => {
              if (!resolvedData)
                return (
                  <ErrorBoundary message="Failed to load company registration details" />
                );
              return (
                <CompanyRegistrationDetailsWrapper
                  data={resolvedData.data}
                  error={resolvedData.error}
                />
              );
            }}
          </Await>
        </Suspense>
      </section>
    </>
  );
}
