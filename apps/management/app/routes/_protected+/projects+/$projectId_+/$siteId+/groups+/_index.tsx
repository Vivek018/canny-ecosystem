import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearExactCacheEntry, clientCaching } from "@/utils/cache";

import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Link,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { Suspense, useEffect, useState } from "react";
import {
  createRole,
  hasPermission,
  readRole,
  searchInObject,
} from "@canny_ecosystem/utils";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import { useUser } from "@/utils/user";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { getGroupsBySiteId } from "@canny_ecosystem/supabase/queries";
import { GroupsDataTable } from "@/components/sites/groups/table/data-table";
import { columns } from "@/components/sites/groups/table/columns";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.groups}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const siteId = params.siteId;

    if (!siteId) {
      throw new Response("Site ID is required", { status: 400 });
    }

    const groupPromise = getGroupsBySiteId({
      supabase,
      siteId,
    });

    return defer({
      groupPromise: groupPromise as any,
      siteId,
    });
  } catch (error) {
    console.error("Group Error in loader function:", error);

    return defer({
      groupPromise: Promise.resolve({ data: [] }),
      siteId: "",
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return clientCaching(`${cacheKeyPrefix.groups}`, args);
}

clientLoader.hydrate = true;

export default function Groups() {
  const { role } = useUser();

  const { groupPromise, siteId } = useLoaderData<typeof loader>();

  return (
    <>
      <Suspense fallback={<LoadingSpinner className="h-1/3" />}>
        <Await resolve={groupPromise}>
          {({ data, error }) => {

            if (error) {
              clearExactCacheEntry(cacheKeyPrefix.groups);
              return (
                <ErrorBoundary error={error} message="Failed to load groups" />
              );
            }
            const [tableData, setTableData] = useState(data);
            const [searchString, setSearchString] = useState("");

            useEffect(() => {
              interface GroupItem {
                [key: string]: any;
              }

              const filteredData: GroupItem[] = data?.filter(
                (item: GroupItem) => searchInObject(item, searchString)
              );
              setTableData(filteredData);
            }, [searchString, data]);

            return (
              <section className="py-4">
                <div className="w-full flex items-center justify-between pb-4">
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
                        placeholder="Search Groups"
                        value={searchString}
                        onChange={(e) => setSearchString(e.target.value)}
                        className="pl-8 h-10 w-full focus-visible:ring-0 shadow-none"
                      />
                    </div>
                    <Link
                      to={`/sites/${siteId}/create-group`}
                      className={cn(
                        buttonVariants({ variant: "primary-outline" }),
                        "flex items-center gap-1",
                        !hasPermission(
                          role,
                          `${createRole}:${attribute.groups}`
                        ) && "hidden"
                      )}
                    >
                      <span>Add</span>
                      <span className="hidden md:flex justify-end">Group</span>
                    </Link>
                  </div>
                </div>
                <GroupsDataTable data={tableData} columns={columns} />
              </section>
            );
          }}
        </Await>
      </Suspense>
      <Outlet />
    </>
  );
}
