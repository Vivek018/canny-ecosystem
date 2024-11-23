import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import {
  isGoodStatus,
  StatutoryBonusSchema,
} from "@canny_ecosystem/utils";
import { getStatutoryBonusById } from "@canny_ecosystem/supabase/queries";
import { updateStatutoryBonus } from "@canny_ecosystem/supabase/mutations";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import CreateStatutoryBonus from "./create-statutory-bonus";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const sbId = params.sbId;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  let sbData = null;

  if (sbId) {
    sbData = await getStatutoryBonusById({
      supabase,
      id: sbId,
    });
  }

  if (sbData?.error) {
    throw sbData.error;
  }

  return json({ data: sbData?.data, companyId });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: StatutoryBonusSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 }
    );
  }

  const { status, error } = await updateStatutoryBonus({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/payment-components/statutory-fields/statutory-bonus", {
      status: 303,
    });
  }
  return json({ status, error });
}

export default function UpdateEmployeeProvidentFund() {
  const { data } = useLoaderData<typeof loader>();
  return <CreateStatutoryBonus updateValues={data} />;
}
