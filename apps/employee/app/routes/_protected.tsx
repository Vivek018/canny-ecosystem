import type { LoaderFunctionArgs } from "@remix-run/node";
import {
	type ClientLoaderFunctionArgs,
	json,
	Link,
	Outlet,
	redirect,
	useLoaderData,
	useSubmit,
} from "@remix-run/react";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { clearAllCache, clientCaching } from "@/utils/cache";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { getEmployeeIdFromCookie, getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { useRequestInfo } from "@/utils/request-info";
import { Logo } from "@canny_ecosystem/ui/logo";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@canny_ecosystem/ui/button";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabase } = getSupabaseWithHeaders({ request });
	const { user: userData } = await getUserCookieOrFetchUser(request, supabase);

	const employeeId = await getEmployeeIdFromCookie(request);

	if(!(userData || employeeId)) {
		return redirect(DEFAULT_ROUTE, { status: 303})
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
	const submit = useSubmit();

	const handleLogout = () => {
		setLoading(true);
		clearAllCache();
		submit({}, { method: "post", action: "/logout", replace: true, });
		setLoading(false);
	};

	return (
		<>
			<header className='flex justify-between items-center mx-5 mt-4 md:mx-8 md:mt-6'>
				<div>
					<Link to={DEFAULT_ROUTE}>
						<Logo />
					</Link>
				</div>
				<div className="flex items-center gap-3">
					<ThemeSwitch theme={requestInfo?.userPrefs.theme ?? "system"} />
					<Button className={cn(!(employeeId || user) && "hidden")} variant={"outline"} onClick={handleLogout}>{isLoading ? "Loading..." : "Logout"}</Button>
				</div>
			</header>
			<Outlet />
		</>
	);
}
