import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { useUser } from "@/utils/user";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLocation } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.users}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  return {};
}

export default function Account() {
  const { role } = useUser();
  const { pathname } = useLocation();

  return (
    <section className='flex flex-col h-full'>
      <div className='py-[18px] px-4 border-b'>
        <SecondaryMenu
          items={[
            { label: "Account", path: "/user/account" },
            { label: "Help", path: "/user/help" },
            { label: "Feedback Form", path: "/user/feedback-form" },
            hasPermission(role, `${readRole}:${attribute.feedbackList}`)
              ? { label: "Feedback List", path: "/user/feedback-list" }
              : {},
          ]}
          pathname={pathname}
          Link={Link}
        />
      </div>
      <div className='px-4 h-full'>
        <Outlet />
      </div>
    </section>
  );
}
