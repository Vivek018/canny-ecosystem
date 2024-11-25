import { safeRedirect } from "@/utils/server/http.server";
import { deleteStateInsurence } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const esiId = params.esiId;

  const { status, error } = await deleteStateInsurence({
    supabase,
    id: esiId ?? "",
  });

  if (isGoodStatus(status)) {
    return safeRedirect(
      "/payment-components/statutory-fields/employee-state-insurance",
      { headers }
    );
  }

  if (error) {
    throw error;
  }

  return json({ error: error?.toString() }, { status: 500 });
}
