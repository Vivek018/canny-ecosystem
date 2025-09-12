import { FooterTabs } from "@/components/footer-tabs";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clientCaching } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
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

  if (!hasPermission(user?.role!, `${readRole}:${attribute.modules}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  return {};
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.modules, args);
}

clientLoader.hydrate = true;

export default function Modules() {
  const { pathname } = useLocation();
  return (
    <section className="flex flex-col h-full w-full">
      <div className="flex items-center gap-4 md:py-2.5 px-4 md:border-b">
        <div className="hidden md:flex md:items-center md:gap-4 w-full">
          <SecondaryMenu
            items={[
              { label: "Sites", path: "/modules/sites" },
              { label: "Projects", path: "/modules/projects" },
              { label: "Departments", path: "/modules/departments" },
            ]}
            pathname={pathname}
            Link={Link}
            className="py-2"
          />
        </div>

        <FooterTabs
          items={[
            { label: "Sites", path: "/modules/sites" },
            { label: "Projects", path: "/modules/projects" },
            { label: "Departments", path: "/modules/departments" },
          ]}
          pathname={pathname}
          Link={Link}
        />
      </div>
      <div className="max-sm:pb-12">
        <Outlet />
      </div>
    </section>
  );
}
