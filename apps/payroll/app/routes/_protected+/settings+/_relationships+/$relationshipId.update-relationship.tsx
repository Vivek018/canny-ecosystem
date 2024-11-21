import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateRelationship from "./create-relationship";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { isGoodStatus, RelationshipSchema } from "@canny_ecosystem/utils";
import {
  getCompanies,
  getRelationshipById,
} from "@canny_ecosystem/supabase/queries";
import { updateRelationship } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";

export const UPDATE_RELATIONSHIP = "update-relationship";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const relationshipId = params.relationshipId;
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  let relationshipData = null;

  if (relationshipId) {
    relationshipData = await getRelationshipById({
      supabase,
      id: relationshipId,
      companyId,
    });
  }

  if (relationshipData?.error) {
    throw relationshipData.error;
  }

  const parentCompanyId = relationshipData?.data?.parent_company_id;
  const { data: companies, error } = await getCompanies({ supabase });

  if (error) {
    throw error;
  }

  if (!companies) {
    throw new Error("No companies found");
  }

  const companyOptions = companies
    .filter((company) => company.id !== parentCompanyId)
    .map((company) => ({ label: company.name, value: company.id }));

  return json({ data: relationshipData?.data, companyOptions });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: RelationshipSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateRelationship({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/settings/relationships", { status: 303 });
  }
  return json({ status, error });
}

export default function UpdateRelationship() {
  const { data, companyOptions } = useLoaderData<typeof loader>();
  return (
    <CreateRelationship
      updateValues={data}
      companyOptionsFromUpdate={companyOptions}
    />
  );
}
