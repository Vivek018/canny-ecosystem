import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { isGoodStatus, ProfessionalTaxSchema } from "@canny_ecosystem/utils";
import { getProfessionalTaxById } from "@canny_ecosystem/supabase/queries";
import { updateProfessionalTax } from "@canny_ecosystem/supabase/mutations";
import CreateProfessionalTax from "./create-professional-tax";

export const UPDATE_PROFESSIONAL_TAX = "update-professional-tax";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const professionalTaxId = params.professionalTaxId;
  const { supabase } = getSupabaseWithHeaders({ request });

  let professionalTaxData = null;

  if (professionalTaxId) {
    professionalTaxData = await getProfessionalTaxById({
      supabase,
      id: professionalTaxId
    });
  }

  if (professionalTaxData?.error) {
    throw professionalTaxData.error;
  }

  return json({ data: professionalTaxData?.data });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: ProfessionalTaxSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateProfessionalTax({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect(
      "/payment-components/statutory-fields/professional-tax",
      { status: 303 }
    );
  }
  return json({ status, error });
}

export default function UpdateProfessionalTax() {
  const { data } = useLoaderData<typeof loader>();
  return <CreateProfessionalTax updateValues={data} />;
}
