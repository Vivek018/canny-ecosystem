import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLocation } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.timeTracking}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  return {};
}

export default function TimeTracking() {
  const { pathname } = useLocation();

  return (
    <section>
      <div className="py-[18px] px-4 border-b">
        <SecondaryMenu
          items={[
            { label: "Attendance", path: "/time-tracking/attendance" },
            { label: "Leaves", path: "/time-tracking/leaves" },
            { label: "Holidays", path: "/time-tracking/holidays" },
          ]}
          pathname={pathname}
          Link={Link}
        />
      </div>
      <div className="px-4">
        <Outlet />
      </div>
    </section>
  );
}
