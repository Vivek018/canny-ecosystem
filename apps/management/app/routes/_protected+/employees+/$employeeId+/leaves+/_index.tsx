import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import {
  getLeavesByEmployeeId,
  getLeaveTypeByCompanyId,
  getUsersEmail,
  type LeaveTypeDataType,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { Suspense } from "react";
import { useToast } from "@canny_ecosystem/ui/use-toast";
import {
  LAZY_LOADING_LIMIT,
  MAX_QUERY_LIMIT,
} from "@canny_ecosystem/supabase/constant";
import { LeavesSearchFilter } from "@/components/employees/leaves/leave-search-filter";
import { FilterList } from "@/components/employees/leaves/filter-list";
import { ColumnVisibility } from "@/components/employees/leaves/column-visibility";
import { AddLeaveDialog } from "@/components/employees/leaves/add-leave-dialog";
import { LeaveCountCards } from "@/components/employees/leaves/leave-count-cards";
import { LeavesDataTable } from "@/components/leaves/table/leaves-table";
import { columns } from "@/components/leaves/table/columns";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { LoadingSpinner } from "@/components/loading-spinner";

const isEmployeeRoute = true;
export async function loader({ request, params }: LoaderFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };
  const { supabase } = getSupabaseWithHeaders({ request });
  const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);
  try {
    const employeeId = params.employeeId;
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const sortParam = searchParams.get("sort");
    const query = searchParams.get("name") ?? undefined;
    const page = 0;

    const filters = {
      date_start: searchParams.get("date_start") ?? undefined,
      date_end: searchParams.get("date_end") ?? undefined,
      leave_type: searchParams.get("leave_type") ?? undefined,
      name: query,
      users: searchParams.get("users") ?? undefined,
    };

    const hasFilters =
      filters &&
      Object.values(filters).some(
        (value) => value !== null && value !== undefined,
      );
    const usersPromise = getUsersEmail({ supabase, companyId });

    const leavesPromise = getLeavesByEmployeeId({
      supabase,
      employeeId: employeeId ?? "",
      params: {
        from: 0,
        to: hasFilters
          ? MAX_QUERY_LIMIT
          : page > 0
            ? LAZY_LOADING_LIMIT
            : LAZY_LOADING_LIMIT - 1,
        filters,
        searchQuery: query ?? undefined,
        sort: sortParam?.split(":") as [string, "asc" | "desc"],
      },
    });

    const leaveTypePromise = getLeaveTypeByCompanyId({ supabase, companyId });

    return defer({
      leavesPromise: leavesPromise as any,
      leaveTypePromise,
      usersPromise,
      employeeId,
      filters,
      env,
    });
  } catch (error) {
    console.error("Leaves Error in loader function:", error);
    return defer({
      leavesPromise: Promise.resolve({ data: [] }),
      usersPromise: Promise.resolve({ data: [] }),
      leaveTypePromise: Promise.resolve({ data: [] }),
      employeeId: "",
      filters: {},
      env,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);

  return clientCaching(
    `${cacheKeyPrefix.employee_leaves}${
      args.params.employeeId
    }${url.searchParams.toString()}`,
    args,
  );
}

clientLoader.hydrate = true;

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string | null;

  const searchParams = new URLSearchParams();
  if (prompt && prompt.trim().length > 0) {
    searchParams.append("name", prompt.trim());
  }

  url.search = searchParams.toString();
  return redirect(url.toString());
}

export default function Leaves() {
  const {
    leavesPromise,
    employeeId,
    filters,
    env,
    usersPromise,
    leaveTypePromise,
  } = useLoaderData<typeof loader>();
  const { toast } = useToast();
  const noFilters = Object.values(filters).every((value) => !value);
  return (
    <section className="py-4" key={leavesPromise}>
      <Suspense fallback={<LoadingSpinner className="w-20 ml-10" />}>
        <Await
          resolve={usersPromise}
          errorElement={
            <div>Error loading user data. Please try again later.</div>
          }
        >
          {(usersData) => (
            <Suspense fallback={<LoadingSpinner className="w-20 ml-10" />}>
              <Await
                resolve={leavesPromise}
                errorElement={
                  <div>Error loading Leaves. Please try again later.</div>
                }
              >
                {({ data, meta, error }) => {
                  if (error) {
                    clearCacheEntry(
                      `${cacheKeyPrefix.employee_leaves}${employeeId}`,
                    );
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "Failed to load Leaves. Please try again.",
                    });
                    return null;
                  }
                  const hasNextPage = Boolean(
                    meta?.count && meta.count / (0 + 1) > LAZY_LOADING_LIMIT,
                  );

                  const leaveType = data!.map((item: any) => {
                    const { leave_type } = item;
                    return {
                      leave_type,
                    };
                  });

                  return (
                    <Suspense fallback={<LoadingSpinner className="h-1/3" />}>
                      <Await
                        resolve={leaveTypePromise}
                        errorElement={
                          <div>
                            Error loading Leave Types. Please try again later.
                          </div>
                        }
                      >
                        {(leaveTypeData) => (
                          <>
                            <LeaveCountCards
                              leaveType={leaveType}
                              leaveTypeData={
                                leaveTypeData?.data as unknown as LeaveTypeDataType
                              }
                            />
                            <div className="w-full flex items-center justify-between pb-4">
                              <div className="w-full flex justify-start items-center gap-x-3">
                                <div className="flex w-[90%] flex-col md:flex-row items-start md:items-center gap-4 mr-14">
                                  <LeavesSearchFilter
                                    disabled={!data?.length && noFilters}
                                    employeeId={employeeId}
                                    isEmployeeRoute={isEmployeeRoute}
                                    userEmails={
                                      usersData?.data
                                        ? usersData?.data?.map(
                                            (user) => user!.email,
                                          )
                                        : []
                                    }
                                  />
                                  <FilterList filters={filters} />
                                </div>
                                <div className="space-x-2 hidden md:flex ">
                                  <ColumnVisibility disabled={!leavesPromise} />
                                  <AddLeaveDialog />
                                </div>
                              </div>
                            </div>
                            <LeavesDataTable
                              data={data}
                              columns={columns(isEmployeeRoute)}
                              noFilters={noFilters}
                              hasNextPage={hasNextPage}
                              pageSize={LAZY_LOADING_LIMIT}
                              env={env}
                              employeeId={employeeId}
                            />
                          </>
                        )}
                      </Await>
                    </Suspense>
                  );
                }}
              </Await>
            </Suspense>
          )}
        </Await>
      </Suspense>
    </section>
  );
}
