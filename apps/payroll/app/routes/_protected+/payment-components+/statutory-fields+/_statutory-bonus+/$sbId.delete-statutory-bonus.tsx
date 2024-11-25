import { safeRedirect } from "@/utils/server/http.server";
import { deleteStatutoryBonus } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const sbId = params.sbId;

  const { status, error } = await deleteStatutoryBonus({
    supabase,
    id: sbId ?? "",
  });

  if (isGoodStatus(status)) {
    return safeRedirect(
      "/payment-components/statutory-fields/statutory-bonus",
      { headers }
    );
  }

  if (error) {
    throw error;
  }

  return json({ error: error?.toString() }, { status: 500 });
}
