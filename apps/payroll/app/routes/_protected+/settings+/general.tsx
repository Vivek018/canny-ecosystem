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
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<Response> {
  try {
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
      return json(
        {
          status: "error",
          message: "Failed to get company",
          error: companyError,
          companyData: null,
          companyRegistrationDetailsData: null,
        },
        { status: 500 },
      );
    }
    if (companyRegistrationDetailsError) {
      return json(
        {
          status: "error",
          message: "Failed to get company registration details",
          error: companyRegistrationDetailsError,
          companyData: null,
          companyRegistrationDetailsData: null,
        },
        { status: 500 },
      );
    }

    if (!companyData) {
      return json(
        {
          status: "info",
          message: "Company not found",
          error: null,
          companyData: null,
          companyRegistrationDetailsData: null,
        },
        { status: 404 },
      );
    }

    return json({
      status: "success",
      message: "Company found",
      error: null,
      companyData,
      companyRegistrationDetailsData,
    });
  } catch (error) {
    return json({
      status: "error",
      message: "Failed to get company",
      error,
      companyData: null,
      companyRegistrationDetailsData: null,
    });
  }
}

export default function SettingGeneral() {
  const {
    companyData,
    companyRegistrationDetailsData,
    status,
    error,
    message,
  } = useLoaderData<typeof loader>();
  const [resetKey, setResetKey] = useState(Date.now());
  const companyId = companyData.id;
  const { toast } = useToast();

  useEffect(() => {
    if (status === "error") {
      toast({
        title: "Error",
        description: error?.message || "Failed to load",
        variant: "destructive",
      });
    }
    if (status === "info") {
      toast({
        title: "Info",
        description: message,
        variant: "info",
      });
    }
    setResetKey(Date.now());
  }, [companyData]);

  return (
    <section className="flex flex-col gap-6 w-full lg:w-2/3 my-4">
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
