import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clientCaching } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { type ClientLoaderFunctionArgs, Link, Outlet, useLocation } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (
    !hasPermission(user?.role!, `${readRole}:${attribute.paymentComponent}`)
  ) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  return {};
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.payroll_components, args);
}

clientLoader.hydrate = true;

export default function PaymentComponents() {
  const { pathname } = useLocation();

  return (
    <section className="flex flex-col h-full">
      <div className="py-[18px] px-4 border-b">
        <SecondaryMenu
          items={[
            // {
            //   label: "Payment Fields",
            //   path: "/payment-components/payment-fields",
            // },
            {
              label: "Statutory fields",
              path: "/payment-components/statutory-fields",
            },
            // {
            //   label: "Payment Templates",
            //   path: "/payment-components/payment-templates",
            // },
          ]}
          pathname={pathname}
          Link={Link}
        />
      </div>
      <Outlet />
    </section>
  );
}
