import { safeRedirect } from "@/utils/server/http.server";
import { deleteExit } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const exitId = params.exitId;

  const { status, error } = await deleteExit({
    supabase,
    id: exitId ?? "",
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/approvals/exits", { headers });
  }

  return json({ error: error?.toString() }, { status: 500 });
}
