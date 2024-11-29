import { safeRedirect } from "@/utils/server/http.server";
import { deleteUserById } from "@canny_ecosystem/supabase/mutations";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { isGoodStatus } from "@canny_ecosystem/utils";
import { type ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const formData = await request.formData();
  const Id = formData.get("id");

  if (!Id || typeof Id !== "string") {
    return json(
      { error: "User ID is required and must be a string" },
      { status: 400 }
    );
  }

  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error("Error logging out:", signOutError);
    return safeRedirect("/user/account", { headers });
  }

  const { error, status } = await deleteUserById({ supabase, id: Id });

  if (isGoodStatus(status)) {
    return safeRedirect("/login", { headers });
  }

  return json({ error: error?.toString() }, { status: 500 });
}
