import { ViewRelationshipTermsDialog } from "@/components/relationships/view-terms-dialog";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getRelationshipTermsById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const relationshipId = params.relationshipId;

  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

  const { data, error } = await getRelationshipTermsById({
    supabase,
    id: relationshipId ?? "",
    companyId,
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No data found");
  }

  return json({ data: data.terms });
}

export default function Relationship() {
  const { data } = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();

  if (
    searchParams.get(modalSearchParamNames.view_relationship_terms) === "true"
  ) {
    return <ViewRelationshipTermsDialog values={data} />;
  }

  return null;
}
