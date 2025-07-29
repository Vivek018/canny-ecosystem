import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import {
  employeeRoleCookie,
  getEmployeeIdFromCookie,
  setUserCookie,
} from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { type ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const employeeId = await getEmployeeIdFromCookie(request);

  if (employeeId) {
    headers.append(
      "Set-Cookie",
      await employeeRoleCookie.serialize("", {
        expires: new Date(0),
        path: "/",
      }),
    );
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error);
    return json({ error: error.message }, { status: 500 });
  }
  headers.append("Set-Cookie", setUserCookie(null, true));
  return safeRedirect(DEFAULT_ROUTE, { headers });
}
