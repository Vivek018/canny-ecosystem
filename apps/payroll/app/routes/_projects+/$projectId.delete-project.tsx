import { safeRedirect } from "@/utils/server/http.server";
import { deleteProject } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const projectId = params.projectId;

  const { status, error } = await deleteProject({
    supabase,
    id: projectId ?? "",
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/projects", { headers });
  }

  return json({ error: error?.toString() }, { status: 500 });
}