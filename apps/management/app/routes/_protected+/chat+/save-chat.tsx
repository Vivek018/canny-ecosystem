import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clientCaching } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getChatsByUserId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { SecondarySidebar } from "@canny_ecosystem/ui/secondary-sidebar";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, type ClientLoaderFunctionArgs } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase, headers } = getSupabaseWithHeaders({ request });
    const { user } = await getUserCookieOrFetchUser(request, supabase);

    if (!hasPermission(user?.role!, `${readRole}:${attribute.chat}`)) {
      return safeRedirect(DEFAULT_ROUTE, { headers });
    }

    if (user?.id) {
      const { data: dbData, error } = await getChatsByUserId({ supabase, userId: user?.id ?? "" });

      const data = dbData?.map(({ prompt, id }) => ({ name: prompt, link: `/chat/save-chat/${id}` }))

      return defer({ data, error });
    }

    return defer({ data: null, error: { message: "No User Id Found" } });
  } catch (error) {
    console.error("Error in action function:", error);
    return defer({ data: null, error: error });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(
    cacheKeyPrefix.save_chat,
    args
  );
}
clientLoader.hydrate = true;

export default function SaveChat() {
  const { data } = useLoaderData<typeof loader>();

  return (
    <section className="flex w-full h-full">
      <SecondarySidebar
        items={data ?? []}
        className="flex-shrink-0"
        navLinkClassName="w-64"
      />
      <div className="flex-1 w-full h-full p-4 flex flex-col overflow-hidden">
        <Outlet context={{ dataLength: data?.length }} />
      </div>
    </section>
  )
}
