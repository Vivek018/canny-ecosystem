import { FooterTabs } from "@/components/footer-tabs";
import { json, Link, Outlet, useLoaderData, useLocation, useParams } from "@remix-run/react";
import { SecondaryMenu } from "@canny_ecosystem/ui/secondary-menu";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { getEmployeeIdFromCookie, getUserCookieOrFetchUser } from "@/utils/server/user.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { safeRedirect } from "@/utils/server/http.server";
import { DEFAULT_ROUTE } from "@/constant";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);
  const cookieEmployeeId = await getEmployeeIdFromCookie(request);

  if (!(cookieEmployeeId || user?.role === "supervisor")) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }

  return json({ user })
}

export default function Employee() {
  const { employeeId } = useParams();
  const { pathname } = useLocation();
  const { user } = useLoaderData<typeof loader>();

  const items = [
    { label: "Overview", path: `/employees/${employeeId}/overview` },
    { label: "Work Portfolio", path: `/employees/${employeeId}/work-portfolio` },
    { label: "Reimbursements", path: `/employees/${employeeId}/reimbursements` },
    { label: "Letters", path: `/employees/${employeeId}/letters` },
    { label: "Attendance", path: `/employees/${employeeId}/attendance` },
    { label: "Payments", path: `/employees/${employeeId}/payments` },
    {
      label: "Leaves",
      path: `/employees/${employeeId}/leaves`,
    },
  ]

  return (
    <section className="relative w-full">
      <div className="flex items-center gap-4 py-2.5 px-4 mt-5 md:border-b border-t">
        <div className="hidden md:flex md:items-center md:gap-4">
          {user && <Link
            prefetch="intent"
            to="/employees"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "bg-card w-9 h-9 px-0 rounded-full"
            )}
          >
            <Icon name="chevron-left" size="sm" />
          </Link>}
          <SecondaryMenu
            items={items}
            pathname={pathname}
            Link={Link}
            className="h-9 mx-3 mt-2 "
          />
        </div>

        {/* Mobile: FooterTabs */}
        <div className="block md:hidden">
          <FooterTabs
            items={items}
            pathname={pathname}
            Link={Link}
          />
        </div>
      </div>
      <div className="px-4 pb-20"><Outlet /></div>
    </section>
  );
}
