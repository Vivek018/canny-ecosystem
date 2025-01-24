import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { deleteUserById } from "@canny_ecosystem/supabase/mutations";
import { getUserByEmail } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import {
  deleteRole,
  hasPermission,
  isGoodStatus,
} from "@canny_ecosystem/utils";
import { type ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ params, request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(`${user?.role!}`, `${deleteRole}:setting_users`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  const userId = params.userId;

  if (!userId || typeof userId !== "string") {
    return json(
      { error: "User ID is required and must be a string" },
      { status: 400 }
    );
  }

  let sameUserLogout = false;
  const { user: sessionUser } = await getSessionUser({ request });
  const { data: dbUser } = await getUserByEmail({
    supabase,
    email: sessionUser?.email ?? "",
  });

  const { error, status } = await deleteUserById({ supabase, id: userId });

  if (dbUser?.id === userId) {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Error logging out:", signOutError);
      return safeRedirect("/setting/users", { headers });
    }
    sameUserLogout = true;
  }

  if (isGoodStatus(status) && sameUserLogout) {
    return safeRedirect("/login", { headers });
  }

  if (isGoodStatus(status)) {
    return safeRedirect("/settings/users", { headers });
  }

  return json({ error: error?.toString() }, { status: 500 });
}
