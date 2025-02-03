import { safeRedirect } from "@/utils/server/http.server";
import { deleteAttendanceByDate } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import { json, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ params, request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  //   const { user } = await getUserCookieOrFetchUser(request, supabase);

  //   if (
  //     !hasPermission(user?.role!, `${deleteRole}:${attribute.reimbursements}`)
  //   ) {
  //     return safeRedirect(DEFAULT_ROUTE, { headers });
  //   }

  const date = params.date;

  const formData = await request.formData();
  const employeeId = formData.get("employeeId");
  

  const { error, status } = await deleteAttendanceByDate({
    supabase,
    date: date as string,
  });

  if (isGoodStatus(status)) {
    return safeRedirect(`/employees/${employeeId}/attendance`);
  }

  return json({ error: error?.toString() }, { status: 500 });
}
