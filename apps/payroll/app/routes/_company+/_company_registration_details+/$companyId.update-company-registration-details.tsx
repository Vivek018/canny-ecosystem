import { safeRedirect } from "@/utils/server/http.server";
import { updateOrCreateCompanyRegistrationDetails } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  CompanyRegistrationDetailsSchema,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { parseWithZod } from "@conform-to/zod";
import { json, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: CompanyRegistrationDetailsSchema,
  });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const { status, error } = await updateOrCreateCompanyRegistrationDetails({
    supabase,
    data: submission.value,
  });

  if (error) {
    console.error(error);
    return safeRedirect("/settings", { status: 303 });
  }

  if (isGoodStatus(status)) {
    return safeRedirect("/settings", { status: 303 });
  }
  return json({ status, error });
}
