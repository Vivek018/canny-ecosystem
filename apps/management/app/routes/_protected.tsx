import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import {
  getUserByEmail,
  getCompanies,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { useTheme } from "@/utils/theme";
import { Header } from "@/components/header";
import { clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { useHotkeys } from "react-hotkeys-hook";
import { managementUserRoles } from "@canny_ecosystem/utils";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user: sessionUser } = await getSessionUser({ request });
  const { supabase } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!managementUserRoles.includes(user?.role ?? "")) {
    return redirect("/no-user-found");
  }

  if (!sessionUser?.email) return redirect("/login");

  const { data: userData, error: userError } = await getUserByEmail({
    supabase,
    email: sessionUser.email,
  });

  if (!userData || userError) return redirect("/no-user-found");

  const { data: companiesData, error: companiesError } = await getCompanies({
    supabase,
  });

  if (companiesError) console.error("Protected Companies", companiesError);

  return json({ user: userData, companies: companiesData });
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.protected, args);
}

clientLoader.hydrate = true;

export default function ProtectedRoute() {
  const { companies, user } = useLoaderData<typeof loader>();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [openNav, setOpenNav] = useState(false);

  useHotkeys(
    ["meta+k", "ctrl+k"],
    () => {
      navigate("/chat/chatbox");
    },
    {
      enableOnFormTags: true,
    },
  );

  return (
    <>
      <Sidebar
        className={cn(
          "flex-none hidden sm:flex fixed top-0 left-0 h-full",
          openNav && "flex fixed z-50",
        )}
        theme={theme ?? "system"}
        user={user}
        setOpenNav={setOpenNav}
      />
      {
        <div
          className={cn(
            "fixed inset-0 bg-background/80 backdrop-blur-sm z-40",
            !openNav && "hidden",
          )}
          onClick={() => setOpenNav(false)}
          onKeyDown={(e) => e.key === "Escape" && setOpenNav(false)}
          role="button"
          tabIndex={0}
          aria-label="Close navigation"
        />
      }
      <div className="flex flex-grow flex-col sm:ml-20 min-h-screen overflow-hidden">
        <Header companies={companies ?? []} setOpenNav={setOpenNav} />
        <div className="flex-1 min-h-0 overflow-scroll">
          <Outlet />
        </div>
      </div>
    </>
  );
}
