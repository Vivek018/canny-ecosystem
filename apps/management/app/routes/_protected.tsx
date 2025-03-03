import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import {
  type ClientLoaderFunctionArgs,
  Outlet,
  useLoaderData,
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

export async function loader({ request }: LoaderFunctionArgs) {
  const { user: sessionUser } = await getSessionUser({ request });

  if (!sessionUser?.email) return redirect("/login");

  const { supabase } = getSupabaseWithHeaders({ request });

  const { data: userData, error: userError } = await getUserByEmail({ supabase, email: sessionUser.email });

  if (!userData || userError) return redirect("/no-user-found");

  const { data: companiesData, error: companiesError } = await getCompanies({ supabase });

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

  return (
    <>
      <Sidebar className='flex-none' theme={theme ?? "system"} user={user} />
      <div className='flex max-h-screen flex-grow flex-col overflow-scroll ml-20'>
        <Header className='px-4' companies={companies ?? []} />
        <div className='h-full'>
          <Outlet />
        </div>
      </div>
    </>
  );
}
