import { cacheKeyPrefix } from "@/constant";
import { clientCaching } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Canny Ecosystem" },
    { name: "description", content: "Welcome to Canny Ecosystem!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user } = await getSessionUser({ request });

  if (!user) {
    return safeRedirect("/login", { status: 303 });
  }

  return safeRedirect("/dashboard", { status: 303 });
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.index, args);
}

clientLoader.hydrate = true;
