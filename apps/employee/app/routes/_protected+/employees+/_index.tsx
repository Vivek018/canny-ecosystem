import { ColumnVisibility } from "@/components/employees/column-visibility";
import { columns } from "@/components/employees/table/columns";
import { DataTable } from "@/components/employees/table/data-table";
import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";
import { safeRedirect } from "@/utils/server/http.server";
import { getEmployeeIdFromCookie } from "@/utils/server/user.server";
import { getSessionUser } from "@canny_ecosystem/supabase/cached-queries";
import {
  getEmployeesBySiteId,
  getUserByEmail,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import { searchInObject } from "@canny_ecosystem/utils";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { supabase } = getSupabaseWithHeaders({ request });
    const { user } = await getSessionUser({ request });

    const employeeId = await getEmployeeIdFromCookie(request);

    if (employeeId) {
      return safeRedirect(`/employees/${employeeId}/overview`, { status: 303 });
    }

    const { data: userProfile, error: userProfileError } = await getUserByEmail(
      { email: user?.email || "", supabase },
    );
    if (userProfileError) throw userProfileError;

    if (!userProfile?.site_id) throw new Error("No site id found");

    const employeesPromise = getEmployeesBySiteId({
      supabase,
      siteId: userProfile?.site_id || "",
    });

    return defer({
      employeesPromise,
      error: null,
    });
  } catch (error) {
    console.error("Employees Error in loader function:", error);

    return defer({
      employeesPromise: Promise.resolve({ data: [], error }),
      error,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(cacheKeyPrefix.employees, args);
}

clientLoader.hydrate = true;

export default function EmployeesIndex() {
  const { employeesPromise, error } = useLoaderData<typeof loader>();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      clearExactCacheEntry(cacheKeyPrefix.employees);
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to load employees",
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <section className="p-4 w-full border-t">
      <Suspense fallback={<div className="h-1/3" />}>
        <Await resolve={employeesPromise}>
          {({ data: backendData, error }) => {
            const [searchString, setSearchString] = useState("");
            const [data, setData] = useState(backendData);

            if (error) {
              clearExactCacheEntry(cacheKeyPrefix.employees);
              return (
                <ErrorBoundary
                  error={error}
                  message="Failed to load employees"
                />
              );
            }

            useEffect(() => {
              const filteredData = backendData?.filter((item) =>
                searchInObject(item, searchString),
              ) as any;
              setData(filteredData);
            }, [searchString, backendData]);

            return (
              <>
                <div className="w-full flex items-center justify-between pb-4 gap-3">
                  <div className="w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4">
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Icon
                          name="magnifying-glass"
                          size="sm"
                          className="text-gray-400"
                        />
                      </div>
                      <Input
                        placeholder="Search Employees"
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                        className="pl-10 h-10 w-full focus-visible:ring-0 shadow-none"
                      />
                    </div>
                  </div>
                  <div className="space-x-2 hidden md:flex">
                    <ColumnVisibility />
                  </div>
                </div>
                <DataTable
                  data={data ?? []}
                  error={error}
                  columns={columns()}
                  searchString={searchString}
                />
              </>
            );
          }}
        </Await>
        <Outlet />
      </Suspense>
    </section>
  );
}
