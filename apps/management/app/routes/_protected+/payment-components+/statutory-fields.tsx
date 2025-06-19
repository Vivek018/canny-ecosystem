import { DEFAULT_ROUTE, statutorySideNavList } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { SecondarySidebar } from "@canny_ecosystem/ui/secondary-sidebar";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.statutoryFields}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  return {};
}

export default function StatutoryFields() {
  return (
    <div className="flex w-full flex-1 overflow-hidden">
      <SecondarySidebar
        items={statutorySideNavList}
        className="flex-shrink-0"
        bottomItem={
          <Link to="/chat/chatbox/reports" className={cn(buttonVariants({ variant: "gradiant", size: "full" }), "flex items-center justify-center gap-2 h-10")
          }>
            <Icon name="magic" size="xs" />
            <p>AI Chat</p>
          </Link>
        }
      />
      <div className="flex flex-col flex-1 min-h-0 overflow-auto" >
        <Outlet />
      </div>
    </div>
  );
}
