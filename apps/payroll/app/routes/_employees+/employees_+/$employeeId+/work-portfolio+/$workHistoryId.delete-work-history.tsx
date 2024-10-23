import { safeRedirect } from "@/utils/server/http.server";
import { deleteEmployeeWorkHistory } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const employeeId = params.employeeId;
  const workHistoryId = params.workHistoryId;

  const { status, error } = await deleteEmployeeWorkHistory({
    supabase,
    id: workHistoryId ?? "",
  });

  if (isGoodStatus(status)) {
    return safeRedirect(`/employees/${employeeId}/work-portfolio`, { headers });
  }

  return json({ error: error?.toString() }, { status: 500 });
}
