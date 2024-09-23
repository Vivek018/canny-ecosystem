import { CompanyDetailsSchema } from "@/components/company/company-details";
import { safeRedirect } from "@/utils/server/http.server";
import { updateCompany } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: CompanyDetailsSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateCompany({
    supabase,
    data: submission.value,
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/settings", { status: 303 });
  }
  return json({ status, error });
}
