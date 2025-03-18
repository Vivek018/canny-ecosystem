import { ColumnVisibility } from "@/components/employees/column-visibility";
import { columns } from "@/components/employees/table/columns";
import { DataTable } from "@/components/employees/table/data-table";
import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getEmployeeIdFromCookie } from "@/utils/server/user.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import { getEmployeesByProjectSiteId, getProjectNamesByCompanyId, getUserByEmail } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Await, type ClientLoaderFunctionArgs, defer, Outlet, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";


export async function loader({ request }: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL: process.env.SUPABASE_URL!,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
	};

	try {
		const { supabase } = getSupabaseWithHeaders({ request });
		const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
		const { user } = await getSessionUser({ request });

		const { data: userProfile, error: userProfileError } = await getUserByEmail({ email: user?.email || "", supabase });
		if (userProfileError) throw userProfileError;

		const employeeId = await getEmployeeIdFromCookie(request);

		if (employeeId) {
			return safeRedirect(`/employees/${employeeId}/overview`, { status: 303 });
		}

		if (!userProfile?.site_id) throw new Error("No site id found");

		const employeesPromise = getEmployeesByProjectSiteId({
			supabase,
			projectSiteId: userProfile?.site_id || "",
		});

		const projectPromise = getProjectNamesByCompanyId({
			supabase,
			companyId,
		});


		return defer({
			employeesPromise: employeesPromise as any,
			projectPromise,
			companyId,
			env,
			error: null
		});
	} catch (error) {
		console.error("Employees Error in loader function:", error);

		return defer({
			employeesPromise: Promise.resolve({ data: [] }),
			projectPromise: Promise.resolve({ data: [] }),
			companyId: "",
			env,
			error,
		});
	}
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
	const url = new URL(args.request.url);
	return clientCaching(
		`${cacheKeyPrefix.employees}${url.searchParams.toString()}`,
		args,
	);
}

clientLoader.hydrate = true;

export default function EmployeesIndex() {
	const {
		employeesPromise,
		projectPromise,
		companyId,
		env,
		error
	} = useLoaderData<typeof loader>();
	const [searchString, setSearchString] = useState("");
	const { toast } = useToast();

	useEffect(() => {
		if (error) {
			toast({
				title: "Error",
				description: (error as Error)?.message || "Failed to load employees",
				variant: "destructive",
			})
		}
	}, [error])

	return (
		<section className="p-4 w-full border-t mt-4">
			<div className="w-full flex items-center justify-between pb-4">
				<div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
					<div className='relative w-full'>
						<div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
							<Icon
								name='magnifying-glass'
								size='sm'
								className='text-gray-400'
							/>
						</div>
						<Input
							placeholder='Search Employees'
							value={searchString}
							onChange={(e) => setSearchString(e.target.value)}
							className='pl-10 h-10 w-full focus-visible:ring-0 shadow-none'
						/>
					</div>
				</div>
				<div className="space-x-2 hidden md:flex">
					<ColumnVisibility disabled={!projectPromise} />
				</div>
			</div>
			<Suspense fallback={<div className="h-1/3" />}>
				<Await resolve={employeesPromise}>
					{({ data, meta, error }) => {
						if (error) {
							clearCacheEntry(cacheKeyPrefix.employees);
							return (
								<ErrorBoundary
									error={error}
									message="Failed to load employees"
								/>
							);
						}

						return (
							<DataTable
								data={data ?? []}
								error={error}
								columns={columns({ env, companyId })}
								count={meta?.count ?? 0}
								companyId={companyId}
								env={env}
								searchString={searchString}
							/>
						);
					}}
				</Await>
				<Outlet />
			</Suspense>
		</section>
	);
}
