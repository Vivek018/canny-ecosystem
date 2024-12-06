import { CompanyDetails } from "@/components/company/company-details";
import { CompanyLogo } from "@/components/company/company-logo";
import { CompanyRegistrationDetails } from "@/components/company/company-registration-details";
import { DeleteCompany } from "@/components/company/delete-company";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  getCompanyById,
  getCompanyRegistrationDetailsByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  const { data: companyData, error: companyError } = await getCompanyById({
    supabase,
    id: companyId!,
  });

  const {
    data: companyRegistrationDetailsData,
    error: companyRegistrationDetailsError,
  } = await getCompanyRegistrationDetailsByCompanyId({
    supabase,
    companyId,
  });

  if (companyError) {
    console.error(companyError);
  }
  if (companyRegistrationDetailsError) {
    console.error(companyRegistrationDetailsError);
  }

  if (!companyData) {
    throw new Error("No company data found");
  }

  return json({ companyData, companyRegistrationDetailsData });
}

export default function SettingGeneral() {
  const { companyData, companyRegistrationDetailsData } =
    useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());
  const companyId = companyData.id;

  useEffect(() => {
    setResetKey(Date.now());
  }, [companyData]);

  return (
    <section className='flex flex-col gap-6 w-full lg:w-2/3 my-4'>
      <CompanyLogo
        name={companyData.name}
        logo={companyData.logo ?? undefined}
      />
      <CompanyDetails key={companyId + resetKey} updateValues={companyData} />
      <CompanyRegistrationDetails
        key={companyId + resetKey + 1}
        updateValues={{
          ...companyRegistrationDetailsData,
          company_id: companyRegistrationDetailsData?.company_id ?? companyId,
        }}
      />
      <DeleteCompany companyId={companyId} />
    </section>
  );
}
