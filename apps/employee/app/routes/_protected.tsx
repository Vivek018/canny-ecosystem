import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  json,
  Link,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
  useSubmit,
} from "@remix-run/react";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { clearAllCache, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import {
  getEmployeeIdFromCookie,
  getUserCookieOrFetchUser,
} from "@/utils/server/user.server";
import { useRequestInfo } from "@/utils/request-info";
import { Logo } from "@canny_ecosystem/ui/logo";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button, buttonVariants } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Icon } from "@canny_ecosystem/ui/icon";
import { managementUserRoles } from "@canny_ecosystem/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = getSupabaseWithHeaders({ request });
  const { user: userData } = await getUserCookieOrFetchUser(request, supabase);

  if (managementUserRoles.includes(userData?.role ?? "")) {
    return redirect("/no-user-found");
  }

  const employeeId = await getEmployeeIdFromCookie(request);

  if (!(userData || employeeId)) {
    return redirect(DEFAULT_ROUTE, { status: 303 });
  }

  return json({ user: userData, employeeId });
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.protected, args);
}

clientLoader.hydrate = true;

export default function ProtectedRoute() {
  const { user, employeeId } = useLoaderData<typeof loader>();
  const requestInfo = useRequestInfo();
  const [isLoading, setLoading] = useState(false);
  const [openNav, setOpenNav] = useState(false);
  const submit = useSubmit();
  const { pathname } = useLocation();
  const handleLogout = () => {
    setLoading(true);
    clearAllCache();
    submit({}, { method: "post", action: "/logout", replace: true });
    setLoading(false);
  };

  return (
    <>
      {user?.role === "location_incharge" && (
        <>
          <Sidebar
            key={pathname}
            setOpenNav={setOpenNav}
            className={cn(
              "flex-none hidden sm:flex fixed top-0 left-0 h-full",
              openNav && "flex fixed z-50"
            )}
          />
          {
            <div
              className={cn(
                "fixed inset-0 bg-background/80 backdrop-blur-sm z-40",
                !openNav && "hidden"
              )}
              onClick={() => setOpenNav(false)}
              onKeyDown={(e) => e.key === "Escape" && setOpenNav(false)}
              role="button"
              tabIndex={0}
              aria-label="Close navigation"
            />
          }
        </>
      )}
      <header className="flex justify-between items-center border border-b-muted px-4 py-[11px]">
        <div className="flex items-center justify-center gap-2">
          {user?.role === "supervisor" && (
            <Link
              prefetch="intent"
              to="/employees"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "bg-card w-12 h-12 px-0 rounded-full md:hidden",
                pathname === "/employees" && "hidden"
              )}
            >
              <Icon name="chevron-left" size="sm" />
            </Link>
          )}
          {user?.role === "supervisor" || employeeId ? (
            <Link to={DEFAULT_ROUTE}>
              <Logo className="w-11 h-11" />
            </Link>
          ) : (
            <Button
              variant={"outline"}
              size="icon"
              className="flex sm:hidden h-9 w-9"
              onClick={() => setOpenNav(true)}
            >
              <Icon name="hamburger" className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitch theme={requestInfo?.userPrefs.theme ?? "system"} />
          <Button
            className={cn(
              "h-12 rounded-full",
              !(employeeId || user) && "hidden"
            )}
            variant="outline"
            onClick={handleLogout}
          >
            {isLoading ? "Loading..." : "Logout"}
          </Button>
        </div>
      </header>
      <div
        className={cn(
          "flex-1 min-h-0",
          user?.role === "location_incharge" && "sm:pl-20 h-max"
        )}
      >
        <Outlet />
      </div>
    </>
  );
}
