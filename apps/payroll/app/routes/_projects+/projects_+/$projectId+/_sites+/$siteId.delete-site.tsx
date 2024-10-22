import { safeRedirect } from "@/utils/server/http.server";
import { deleteSite } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const siteId = params.siteId;
  const projectId = params.projectId;

  const { status, error } = await deleteSite({
    supabase,
    id: siteId ?? "",
  });

  if (isGoodStatus(status)) {
    return safeRedirect(`/projects/${projectId}/sites`, { headers });
  }

  if (error) {
    throw error;
  }

  return json({ error: error?.toString() }, { status: 500 });
}
