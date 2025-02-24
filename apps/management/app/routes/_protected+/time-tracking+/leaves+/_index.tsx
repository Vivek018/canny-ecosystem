import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getLeavesByCompanyId,
  getProjectNamesByCompanyId,
  getSiteNamesByProjectName,
  getUsersEmail,
  type LeavesFilters,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Outlet,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { Suspense } from "react";
import { hasPermission, readRole } from "@canny_ecosystem/utils";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { LeavesDataTable } from "@/components/leaves/table/leaves-table";
import { columns } from "@/components/leaves/table/columns";
import { LeavesSearchFilter } from "@/components/employees/leaves/leave-search-filter";
import { FilterList } from "@/components/employees/leaves/filter-list";
import { ColumnVisibility } from "@/components/employees/leaves/column-visibility";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useLeavesStore } from "@/store/leaves";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Button } from "@canny_ecosystem/ui/button";
import { ImportLeavesMenu } from "@/components/leaves/import-menu";
import { ImportLeavesModal } from "@/components/leaves/import-export/import-modal-leaves";

const pageSize = LAZY_LOADING_LIMIT;
const isEmployeeRoute = false;
export async function loader({ request }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.leaves}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const url = new URL(request.url);
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
    const page = 0;

    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? undefined;

    const filters: LeavesFilters = {
      date_start: searchParams.get("date_start") ?? undefined,
      date_end: searchParams.get("date_end") ?? undefined,
      leave_type: searchParams.get("leave_type") ?? undefined,
      name: query,
      project: searchParams.get("project") ?? undefined,
      project_site: searchParams.get("project_site") ?? undefined,
      users: searchParams.get("users") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined
      );

    const leavesPromise = getLeavesByCompanyId({
      supabase,
      companyId,
      params: {
        from: 0,
        to: hasFilters ? MAX_QUERY_LIMIT : page > 0 ? pageSize : pageSize - 1,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });
    const userEmailsPromise = getUsersEmail({ supabase, companyId });
    const projectPromise = getProjectNamesByCompanyId({ supabase, companyId });

    let projectSitePromise = null;
    if (filters.project)
      projectSitePromise = getSiteNamesByProjectName({
        supabase,
        projectName: filters.project,
      });

    return defer({
      leavesPromise: leavesPromise as any,
      projectPromise,
      projectSitePromise,
      userEmailsPromise,
      query,
      filters,
      companyId,
      env,
    });
  } catch (error) {
    console.error("Leaves Error in loader function:", error);

    return defer({
      leavesPromise: Promise.resolve({ data: [] }),
      projectPromise: Promise.resolve({ data: [] }),
      projectSitePromise: Promise.resolve({ data: [] }),
      userEmailsPromise: Promise.resolve({ data: [] }),
      query: "",
      filters: null,
      companyId: "",
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return await clientCaching(
    `${cacheKeyPrefix.leaves}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export default function LeavesIndex() {
  const navigate = useNavigate();
  const {
    leavesPromise,
    projectPromise,
    projectSitePromise,
    userEmailsPromise,
    query,
    filters,
    companyId,
    env,
  } = useLoaderData<typeof loader>();
  const { selectedRows } = useLeavesStore();
  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className='py-4'>
      <div className='w-full flex items-center justify-between pb-4'>
        <div className='flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-4'>
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={projectPromise}>
              {(projectData) => (
                <Await resolve={projectSitePromise}>
                  {(projectSiteData) => (
                    <Await resolve={userEmailsPromise}>
                      {(userEmailsData) => (
                        <LeavesSearchFilter
                          disabled={!projectData?.data?.length && noFilters}
                          isEmployeeRoute={isEmployeeRoute}
                          projectArray={
                            projectData?.data?.length
                              ? projectData?.data?.map(
                                  (project) => project!.name
                                )
                              : []
                          }
                          projectSiteArray={
                            projectSiteData?.data?.length
                              ? projectSiteData?.data?.map((site) => site!.name)
                              : []
                          }
                          userEmails={
                            userEmailsData?.data?.length
                              ? userEmailsData?.data?.map((user) => user!.email)
                              : []
                          }
                        />
                      )}
                    </Await>
                  )}
                </Await>
              )}
            </Await>
          </Suspense>
          <FilterList filters={filterList} />
        </div>
        <div className='space-x-2 hidden md:flex'>
          <Button
            variant='outline'
            size='icon'
            className={cn("h-10 w-10", !selectedRows.length && "hidden")}
            disabled={!selectedRows.length}
            onClick={() => navigate("/time-tracking/leaves/analytics")}
          >
            <Icon name='chart' className='h-[18px] w-[18px]' />
          </Button>
          <ColumnVisibility />
          <ImportLeavesMenu />
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={leavesPromise}>
          {({ data, meta, error }) => {
            if (error) {
              clearCacheEntry(cacheKeyPrefix.leaves);
              return (
                <ErrorBoundary error={error} message='Failed to load leaves' />
              );
            }

            const hasNextPage = Boolean(meta?.count > pageSize);

            return (
              <LeavesDataTable
                data={data ?? []}
                columns={columns(isEmployeeRoute)}
                query={query}
                filters={filters}
                noFilters={noFilters}
                hasNextPage={hasNextPage}
                pageSize={pageSize}
                companyId={companyId}
                env={env}
              />
            );
          }}
        </Await>
      </Suspense>
      <ImportLeavesModal />
      <Outlet />
    </section>
  );
}
