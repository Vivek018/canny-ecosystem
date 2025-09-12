import { ErrorBoundary } from "@/components/error-boundary";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import {
  getCompanyNameByCompanyId,
  getLeavesByCompanyId,
  getLeaveTypeByCompanyId,
  getPrimaryLocationByCompanyId,
  getProjectNamesByCompanyId,
  getSiteNamesByCompanyId,
  getUsersEmail,
  type LeavesFilters,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { Suspense } from "react";
import {
  createRole,
  deleteRole,
  hasPermission,
  readRole,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { safeRedirect } from "@/utils/server/http.server";
import { attribute } from "@canny_ecosystem/utils/constant";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { LeavesDataTable } from "@/components/leaves/table/leaves-table";
import { columns } from "@/components/leaves/table/columns";
import { LeavesSearchFilter } from "@/components/employees/leaves/leave-search-filter";
import { FilterList } from "@/components/employees/leaves/filter-list";
import { ColumnVisibility } from "@/components/employees/leaves/column-visibility";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Icon } from "@canny_ecosystem/ui/icon";
import { useLeavesStore } from "@/store/leaves";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import { Button } from "@canny_ecosystem/ui/button";
import { LeavesMenu } from "@/components/leaves/leaves-menu";
import { ImportLeavesModal } from "@/components/leaves/import-export/import-modal-leaves";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { LeaveTypeOptionsDropdown } from "@/components/leaves/leave-types/leave-type-option-dropdown";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { useUser } from "@/utils/user";
import type {
  CompanyDatabaseRow,
  LocationDatabaseRow,
} from "@canny_ecosystem/supabase/types";
import { generateLeavesFilter } from "@/utils/ai/leave";

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
      site: searchParams.get("site") ?? undefined,
      users: searchParams.get("users") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      recently_added: searchParams.get("recently_added") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined,
      );

    const { data: companyName } = await getCompanyNameByCompanyId({
      supabase,
      id: companyId,
    });
    const { data: companyAddress } = await getPrimaryLocationByCompanyId({
      supabase,
      companyId,
    });

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

    const leaveTypePromise = getLeaveTypeByCompanyId({
      supabase,
      companyId,
    });

    const userEmailsPromise = getUsersEmail({ supabase, companyId });
    const projectPromise = getProjectNamesByCompanyId({ supabase, companyId });

    const sitePromise = getSiteNamesByCompanyId({
      supabase,
      companyId,
    });

    return defer({
      leavesPromise: leavesPromise as any,
      projectPromise,
      sitePromise,
      leaveTypePromise,
      userEmailsPromise,
      query,
      filters,
      companyId,
      env,
      companyName,
      companyAddress,
    });
  } catch (error) {
    console.error("Leaves Error in loader function:", error);

    return defer({
      leavesPromise: Promise.resolve({ data: [] }),
      projectPromise: Promise.resolve({ data: [] }),
      leaveTypePromise: Promise.resolve({ data: [], error: null }),
      sitePromise: Promise.resolve({ data: [] }),
      userEmailsPromise: Promise.resolve({ data: [] }),
      query: "",
      filters: null,
      companyId: "",
      env,
      companyName: null,
      companyAddress: null,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.leaves}${url.searchParams.toString()}`,
    args,
  );
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;

    const { object } = await generateLeavesFilter({ input: prompt });

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(object)) {
      if (value !== null && value !== undefined && String(value)?.length) {
        searchParams.append(key, value.toString());
      }
    }

    url.search = searchParams.toString();

    return redirect(url.toString());
  } catch (error) {
    console.error("Leaves Error in action function:", error);

    const fallbackUrl = new URL(request.url);
    fallbackUrl.search = "";
    return redirect(fallbackUrl.toString());
  }
}
export default function LeavesIndex() {
  const {
    leavesPromise,
    projectPromise,
    leaveTypePromise,
    sitePromise,
    userEmailsPromise,
    query,
    filters,
    companyId,
    env,
    companyName,
    companyAddress,
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { role } = useUser();
  const { selectedRows } = useLeavesStore();
  const filterList = { ...filters, name: query };
  const noFilters = Object.values(filterList).every((value) => !value);

  return (
    <section className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Suspense fallback={<LoadingSpinner />}>
          <Await resolve={leaveTypePromise}>
            {({ data, error }) => {
              if (error) {
                clearCacheEntry(cacheKeyPrefix.leaves);
                return (
                  <ErrorBoundary
                    error={error}
                    message="Failed to load leave types"
                  />
                );
              }

              return (
                <>
                  {data?.map((leave, index) => (
                    <Card key={leave?.id ?? index.toString()}>
                      <LeaveTypeOptionsDropdown
                        id={leave?.id ?? index.toString()}
                        triggerChild={
                          <DropdownMenuTrigger
                            className={cn(
                              "p-2 py-2 ml-auto mr-2 mt-2 rounded-md  grid place-items-center",
                              !hasPermission(
                                role,
                                `${deleteRole}:${attribute.leaves}`,
                              ) &&
                                !hasPermission(
                                  role,
                                  `${updateRole}:${attribute.leaves}`,
                                ) &&
                                "hidden",
                            )}
                          >
                            <Icon name="dots-vertical" size="xs" />
                          </DropdownMenuTrigger>
                        }
                      />
                      <CardHeader className="p-0">
                        <CardTitle className="text-lg text-center capitalize">
                          {replaceUnderscore(leave?.leave_type)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-center">
                          Available Days: {leave?.leaves_per_year}
                        </p>
                      </CardContent>
                    </Card>
                  ))}

                  {(data?.length ?? 0) < 5 && (
                    <Card
                      className="h-28 bg-muted/40 dark:bg-muted/80 cursor-pointer grid place-items-center"
                      onClick={() => {
                        if (
                          hasPermission(
                            role,
                            `${createRole}:${attribute.leaves}`,
                          )
                        )
                          navigate("add-leave-type");
                      }}
                    >
                      <Icon
                        name="plus"
                        size="xl"
                        className="shrink-0 flex justify-center items-center"
                      />
                    </Card>
                  )}
                </>
              );
            }}
          </Await>
        </Suspense>
      </div>
      <div className="mt-5">
        <div className="w-full flex items-center max-sm:items-start max-md:items-start justify-between pb-4">
          <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-2 mr-4">
            <Suspense fallback={<LoadingSpinner className="w-1/2" />}>
              <Await resolve={projectPromise}>
                {(projectData) => (
                  <Await resolve={sitePromise}>
                    {(siteData) => (
                      <Await resolve={userEmailsPromise}>
                        {(userEmailsData) => (
                          <LeavesSearchFilter
                            isEmployeeRoute={isEmployeeRoute}
                            projectArray={
                              projectData?.data?.length
                                ? projectData?.data?.map(
                                    (project) => project!.name,
                                  )
                                : []
                            }
                            siteArray={
                              siteData?.data?.length
                                ? siteData?.data?.map((site) => site!.name)
                                : []
                            }
                            userEmails={
                              userEmailsData?.data?.length
                                ? userEmailsData?.data?.map(
                                    (user) => user!.email,
                                  )
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
          <div className="gap-4 flex">
            <div className="flex gap-2">
              <ColumnVisibility />
              {/* <LeavesEmailMenu
              columnVisibility={columnVisibility}
              selectedRows={selectedRows}
              emails={userEmails as unknown as any}
              companyName={companyName as unknown as CompanyDatabaseRow}
              companyAddress={companyAddress as unknown as LocationDatabaseRow}
            /> */}
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-10 w-10 bg-muted/70 text-muted-foreground",
                  !selectedRows.length && "hidden",
                )}
                disabled={!selectedRows.length}
                onClick={() => navigate("analytics")}
              >
                <Icon name="chart" className="h-[18px] w-[18px]" />
              </Button>
              <LeavesMenu
                companyName={companyName as unknown as CompanyDatabaseRow}
                companyAddress={
                  companyAddress as unknown as LocationDatabaseRow
                }
              />
            </div>
          </div>
        </div>
        <Suspense fallback={<LoadingSpinner className="h-1/2 mt-20" />}>
          <Await resolve={leavesPromise}>
            {({ data, meta, error }) => {
              if (error) {
                clearCacheEntry(cacheKeyPrefix.leaves);
                return (
                  <ErrorBoundary
                    error={error}
                    message="Failed to load leaves"
                  />
                );
              }

              const hasNextPage = Boolean(meta?.count > data?.length);

              return (
                <LeavesDataTable
                  data={data}
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
      </div>
      <ImportLeavesModal />
      <Outlet />
    </section>
  );
}
