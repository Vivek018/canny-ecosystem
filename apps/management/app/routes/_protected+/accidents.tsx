import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, Link } from "@remix-run/react";

// export async function loader({ request }: LoaderFunctionArgs) {
//   const { supabase, headers } = getSupabaseWithHeaders({ request });
//   const { user } = await getUserCookieOrFetchUser(request, supabase);

//   if (!hasPermission(user?.role!, `${readRole}:${attribute.payroll}`)) {
//     return safeRedirect(DEFAULT_ROUTE, { headers });
//   }
//   return {};
// }

export default function AccidentRecords() {
  return <Outlet />;
}
