import { ViewRelationshipTermsDialog } from "@/components/relationships/view-terms-dialog";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { getRelationshipTermsById } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { modalSearchParamNames } from "@canny_ecosystem/utils/constant";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const relationshipId = params.relationshipId;

  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const { data, error } = await getRelationshipTermsById({
      supabase,
      id: relationshipId ?? "",
      companyId,
    });

    if (error) {
      return json({
        status: "error",
        message: error.message,
        error,
        data: null,
      });
    }

    if (!data) {
      return json({
        status: "info",
        message: "No terms found for this relationship",
        data: null,
        error: null,
      });
    }

    return json({
      status: "success",
      message: "Terms found",
      error: null,
      data: data.terms,
    });
  } catch (error) {
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

export default function Relationship() {
  const { data } = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();

  const step = searchParams.get("step");

  if (step === modalSearchParamNames.view_relationship_terms) {
    return <ViewRelationshipTermsDialog values={data} />;
  }

  return null;
}
