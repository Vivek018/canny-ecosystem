import { DEFAULT_ROUTE } from "@/constant";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.reports}`)) {
    return safeRedirect(DEFAULT_ROUTE, { headers });
  }
  return {}
}

export default function ReportsIndex() {
  return (
    <section className="grid grid-cols-3 gap-10 py-6 px-6">
      <div>
        <h1 className="flex items-center tracking-wide font-bold justify-between pb-4 text-xl">
          Gratuity Reports
        </h1>
        <Link
          to="gratuity"
          className={cn(buttonVariants({ variant: "link" }), "px-0")}
        >
          Gratuity Eligibility
        </Link>
      </div>

      <div>
        <h1 className="flex items-center tracking-wide font-bold justify-between pb-4 text-xl">
          Statutory Reports
        </h1>
        <div className="flex flex-col items-start">
          <Link
            to="/reports/epf"
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            EPF Summary
          </Link>

          <Link
            to="/reports/esi"
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            ESI Summary
          </Link>

          <Link
            to="/reports/pt"
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            PT Summary
          </Link>

          <Link
            to="/reports/lwf"
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            LWF Summary
          </Link>

          <Link
            to="/reports/statutory-bonus-yearly"
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            Statutory Bonus (Yearly)
          </Link>

          <Link
            to={"/reports/statutory-bonus-monthly"}
            className={cn(buttonVariants({ variant: "link" }), "px-0")}
          >
            Statutory Bonus (Monthly)
          </Link>
        </div>
      </div>
    </section>
  );
}
