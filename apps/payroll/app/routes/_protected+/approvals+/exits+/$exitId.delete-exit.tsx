import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { deleteExit } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(`${user?.role!}`, `${deleteRole}:exits`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
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
