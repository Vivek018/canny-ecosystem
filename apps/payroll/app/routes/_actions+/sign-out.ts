import { safeRedirect } from "@/utils/server/http.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json } from "@remix-run/node";

export async function action({ request }: { request: Request }) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { error } = await supabase.auth.signOut();

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return safeRedirect("/sign-in", { headers });
}
