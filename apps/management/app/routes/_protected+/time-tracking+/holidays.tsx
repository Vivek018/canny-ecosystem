import { ErrorBoundary } from "@/components/error-boundary";
import { columns } from "@/components/holidays/table/columns";
import { HolidaysDataTable } from "@/components/holidays/table/data-table";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { useUser } from "@/utils/user";
import { getHolidaysByCompanyId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  createRole,
  hasPermission,
  readRole,
  searchInObject,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { type SetStateAction, Suspense, useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.holidays}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const holidaysPromise = getHolidaysByCompanyId({ supabase, companyId });
    return defer({
      holidaysPromise: holidaysPromise,
    });
  } catch (error) {
    console.error("Leave Types Error in loader function:", error);

    return defer({
      holidaysPromise: Promise.resolve({ data: [], error: null }),
    });
  }
}
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.holidays, args);
}

clientLoader.hydrate = true;

export default function Holidays() {
  const { holidaysPromise } = useLoaderData<typeof loader>();
  const { role } = useUser();
  return (
    <>
      <Suspense fallback={<LoadingSpinner className="my-30" />}>
        <Await resolve={holidaysPromise}>
          {({ data, error }) => {
            if (error) {
              clearExactCacheEntry(cacheKeyPrefix.holidays);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load holidays"
                />
              );
            }
            const [searchString, setSearchString] = useState("");
            const [tableData, setTableData] = useState(data);

            useEffect(() => {
              const filteredData = data?.filter((item) =>
                searchInObject(item, searchString),
              );

              setTableData(filteredData ?? []);
            }, [searchString, data]);

            return (
              <div className="px-4">
                <div className="relative w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
                  <div className="relative w-full my-4">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Icon
                        name="magnifying-glass"
                        size="sm"
                        className="text-gray-400"
                      />
                    </div>
                    <Input
                      placeholder="Search Holidays"
                      value={searchString}
                      onChange={(e: {
                        target: { value: SetStateAction<string> };
                      }) => setSearchString(e.target.value)}
                      className="pl-8 h-10 w-full focus-visible:ring-0 shadow-none"
                    />
                  </div>
                  <Link
                    to="/time-tracking/holidays/add-holiday"
                    className={cn(
                      buttonVariants({ variant: "primary-outline" }),
                      "flex items-center gap-1",
                      !hasPermission(
                        role,
                        `${createRole}:${attribute.holidays}`,
                      ) && "hidden",
                    )}
                  >
                    <span>Add</span>
                    <span className="hidden md:flex justify-end">Holiday</span>
                  </Link>
                </div>
                <HolidaysDataTable data={tableData ?? []} columns={columns} />
              </div>
            );
          }}
        </Await>
      </Suspense>
      <Outlet />
    </>
  );
}
