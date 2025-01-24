import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteReimbursementById } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { json, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ params, request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${deleteRole}:reimbursements`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

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
