import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabase, headers } = getSupabaseWithHeaders({ request });
	const { user } = await getUserCookieOrFetchUser(request, supabase);

	if (user && user?.role !== "supervisor") {
		return safeRedirect("/no-user-found", { status: 303, headers });
	}

	return {};
}

export default function Employees() {
	return <Outlet />
}