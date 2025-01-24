import { DEFAULT_ROUTE, statutorySideNavList } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondarySidebar } from "@canny_ecosystem/ui/secondary-sidebar";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${readRole}:${attribute.statutoryFieldsEpf}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  return {};
}

export default function StatutoryFields() {
  return (
    <div className="flex h-full">
      <SecondarySidebar
        items={statutorySideNavList}
        className="flex-shrink-0"
      />
      <div className="h-full w-full">
        <Outlet />
      </div>
    </div>
  );
}
