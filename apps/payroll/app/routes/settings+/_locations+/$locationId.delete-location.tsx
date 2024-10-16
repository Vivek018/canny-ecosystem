import { safeRedirect } from "@/utils/server/http.server";
import { deleteLocation } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/react";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const locationId = params.locationId;

  const { status, error } = await deleteLocation({
    supabase,
    id: locationId ?? "",
  });

  if (isGoodStatus(status)) {
    return safeRedirect("/settings/locations", { headers });
  }

  if (error) {
    throw error;
  }

  return json({ error: error?.toString() }, { status: 500 });
}
