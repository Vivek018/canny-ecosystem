import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clientCaching } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { FooterTabs } from "@/components/footer-tabs";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Outlet,
  useLocation,
  Link,
  type ClientLoaderFunctionArgs,
} from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (user?.role !== "location_incharge") {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  return {};
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.approvals, args);
}

clientLoader.hydrate = true;

export default function Approvals() {
  const { pathname } = useLocation();
  return (
    <section className="flex flex-col h-full w-full">
      <div className="flex items-center gap-4 md:py-2.5 px-4 md:border-b border-t">
        <div className="hidden md:flex md:items-center md:gap-4 w-full">
          <SecondaryMenu
            items={[
              {
                label: "Reimbursements",
                path: "/approvals/reimbursements",
              },
              {
                label: "Exits",
                path: "/approvals/exits",
              },
            ]}
            pathname={pathname}
            Link={Link}
            className="py-2"
          />
        </div>

        <FooterTabs
          items={[
            {
              label: "Reimbursements",
              path: "/approvals/reimbursements",
            },
            {
              label: "Exits",
              path: "/approvals/exits",
            },
          ]}
          pathname={pathname}
          Link={Link}
        />
      </div>
      <div className="px-4 max-sm:px-2 w-full">
        <Outlet />
      </div>
    </section>
  );
}
