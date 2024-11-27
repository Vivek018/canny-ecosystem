import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import CreateLabourWelfareFund from "./create-labour-welfare-fund";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "@/utils/server/http.server";
import { isGoodStatus, LabourWelfareFundSchema } from "@canny_ecosystem/utils";
import { getLabourWelfareFundById } from "@canny_ecosystem/supabase/queries";
import { updateLabourWelfareFund } from "@canny_ecosystem/supabase/mutations";

export const UPDATE_LABOUR_WELFARE_FUND = "update-labour-welfare-fund";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const labourWelfareFundId = params.labourWelfareFundId;
  const { supabase } = getSupabaseWithHeaders({ request });

  let labourWelfareFundData = null;

  if (labourWelfareFundId) {
    labourWelfareFundData = await getLabourWelfareFundById({
      supabase,
      id: labourWelfareFundId
    });
  }

  if (labourWelfareFundData?.error) throw labourWelfareFundData.error;

  return json({ data: labourWelfareFundData?.data });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: LabourWelfareFundSchema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateLabourWelfareFund({ supabase, data: submission.value });

  if (isGoodStatus(status)) return safeRedirect("/payment-components/statutory-fields/labour-welfare-fund", { status: 303 });

  return json({ status, error });
}

export default function UpdateLocation() {
  const { data } = useLoaderData<typeof loader>();
  return <CreateLabourWelfareFund updateValues={data} />
}
