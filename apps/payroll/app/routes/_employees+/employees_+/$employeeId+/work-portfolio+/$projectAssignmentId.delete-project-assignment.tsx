import { safeRedirect } from "@/utils/server/http.server";
import { deleteEmployeeProjectAssignment } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const employeeId = params.employeeId;
  const projectAssignmentId = params.projectAssignmentId;

  const { status, error } = await deleteEmployeeProjectAssignment({
    supabase,
    id: projectAssignmentId ?? "",
  });

  if (isGoodStatus(status)) {
    return safeRedirect(`/employees/${employeeId}/work-portfolio`, { headers });
  }

  return json({ error: error?.toString() }, { status: 500 });
}
