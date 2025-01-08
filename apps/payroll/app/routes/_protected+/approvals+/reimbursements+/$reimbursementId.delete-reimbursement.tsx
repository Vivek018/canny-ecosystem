import { safeRedirect } from "@/utils/server/http.server";
import { deleteReimbursementById } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import { json, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ params, request }: ActionFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const reimbursementId = params.reimbursementId;

  const formData = await request.formData();
  const employeeId = formData.get("employeeId");
  const returnTo = formData.get("returnTo");
  const { error, status } = await deleteReimbursementById({
    supabase,
    id: reimbursementId as string,
  });

  if (isGoodStatus(status)) {
    return safeRedirect(returnTo ?? `/employees/${employeeId}/reimbursements`);
  }

  return json({ error: error?.toString() }, { status: 500 });
}
