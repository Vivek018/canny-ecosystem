import { safeRedirect } from "@/utils/server/http.server";
import { deleteEmployeeProvidentFund } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const epfId = params.epfId;

  const { status, error } = await deleteEmployeeProvidentFund({
    supabase,
    id: epfId ?? "",
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/payment_fields/employee-provident-fund", { headers });
  }

  if (error) {
    throw error;
  }

  return json({ error: error?.toString() }, { status: 500 });
}
