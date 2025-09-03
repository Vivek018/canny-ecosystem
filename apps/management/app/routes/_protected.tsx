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
      <Sidebar className="flex-none" theme={theme ?? "system"} user={user} />
      <div className="flex flex-grow flex-col ml-20 min-h-screen overflow-hidden">
        <Header companies={companies ?? []} />
        <div className="flex-1 min-h-0 overflow-scroll">
          <Outlet />
        </div>
      </div>
    </>
  );
}
