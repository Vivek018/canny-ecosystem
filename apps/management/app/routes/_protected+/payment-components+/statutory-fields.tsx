import { FooterTabs } from "@/components/footer-tabs";
import { DEFAULT_ROUTE, statutorySideNavList } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondarySidebar } from "@canny_ecosystem/ui/secondary-sidebar";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLocation } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.statutoryFields}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  return {};
}

export default function StatutoryFields() {
  const { pathname } = useLocation();

  const items = [
    {
      label: "EPF",
      path: "/payment-components/statutory-fields/employee-provident-fund",
    },
    {
      label: "ESI",
      path: "/payment-components/statutory-fields/employee-state-insurance",
    },
    {
      label: "Professional Tax",
      path: "/payment-components/statutory-fields/professional-tax",
    },
    {
      label: "Labour welfare fund",
      path: "/payment-components/statutory-fields/labour-welfare-fund",
    },
    {
      label: "Statutory Bonus",
      path: "/payment-components/statutory-fields/statutory-bonus",
    },
    {
      label: "Gratuity",
      path: "/payment-components/statutory-fields/gratuity",
    },
    {
      label: "Leave Encashment",
      path: "/payment-components/statutory-fields/leave-encashment",
    },
  ];

  return (
    <div className="flex w-full flex-1 overflow-hidden">
      <div className="hidden md:flex">
        <SecondarySidebar
          items={statutorySideNavList}
          className="flex-shrink-0"
        />
      </div>
      <FooterTabs items={items} pathname={pathname} Link={Link} />
      <div className="flex flex-col flex-1 min-h-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
