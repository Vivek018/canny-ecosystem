import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { json, redirect } from "@remix-run/node";

export const action = async ({ request }: { request: Request }) => {
  const { supabase, headers } = getSupabaseWithHeaders({ request });

  const { error } = await supabase.auth.signOut();

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return redirect("/sign-in", { headers });
};
