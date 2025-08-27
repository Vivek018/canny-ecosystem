import { safeRedirect } from "@/utils/server/http.server";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  getEmployeeIdFromCookie,
  getUserCookieOrFetchUser,
} from "@/utils/server/user.server";
import { clientCaching } from "@/utils/cache";
import { cacheKeyPrefix } from "@/constant";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";

export const meta: MetaFunction = () => {
  return [
    { title: "Canny Employee" },
    { name: "description", content: "Welcome to Canny Employee!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);
  const employeeId = await getEmployeeIdFromCookie(request);

  if (!(user || employeeId)) {
    return safeRedirect("/login", { status: 303 });
  }
  if (
    user?.role &&
    user.role !== "supervisor" &&
    user.role !== "location_incharge"
  ) {
    return safeRedirect("/no-user-found", { headers });
  }

  if (employeeId) {
    return safeRedirect(`/employees/${employeeId}/overview`, { status: 303 });
  }
  return safeRedirect("/employees", { status: 303 });
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.index, args);
}

clientLoader.hydrate = true;
