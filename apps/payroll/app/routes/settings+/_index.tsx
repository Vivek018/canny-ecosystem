import { CompanyDetails } from "@/components/company/company-details";
import { CompanyLogo } from "@/components/company/company-logo";
import { DeleteCompany } from "@/components/company/delete-company";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getCompanyByIdQuery } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data, error } = await getCompanyByIdQuery({
    supabase,
    id: companyId!,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No data found");
  }

  return json({ data });
}

export default function SettingGeneral() {
  const { data } = useLoaderData<typeof loader>();
  const companyId = data.id;

  return (
    <section className="flex flex-col gap-6 w-full lg:w-4/6 mt-6">
      <CompanyLogo name={data.name} logo={data.logo ?? undefined} />
      <CompanyDetails
        key={companyId}
        updateValues={{
          id: data.id,
          name: data.name,
          email_suffix: data.email_suffix,
        }}
      />
      <DeleteCompany companyId={companyId} />
    </section>
  );
}
