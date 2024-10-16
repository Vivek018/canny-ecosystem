import { safeRedirect } from "@/utils/server/http.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { type ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error);
    return json({ error: error.message }, { status: 500 });
  }

  return safeRedirect("/login", {headers});
}
