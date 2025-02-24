import { ErrorBoundary } from "@/components/error-boundary";
import { LeaveTypeOptionsDropdown } from "@/components/holidays/leave-types/leave-type-option-dropdown";
import { columns } from "@/components/holidays/table/columns";
import { HolidaysDataTable } from "@/components/holidays/table/data-table";
import { cacheKeyPrefix, DEFAULT_ROUTE } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getCompanyIdOrFirstCompany } from "@/utils/server/company.server";
import { safeRedirect } from "@/utils/server/http.server";
import { getUserCookieOrFetchUser } from "@/utils/server/user.server";
import { useUser } from "@/utils/user";
import {
  getHolidaysByCompanyId,
  getLeaveTypeByCompanyId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { LeaveTypeDatabaseRow } from "@canny_ecosystem/supabase/types";
import { buttonVariants } from "@canny_ecosystem/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@canny_ecosystem/ui/card";
import { DropdownMenuTrigger } from "@canny_ecosystem/ui/dropdown-menu";
import { Icon } from "@canny_ecosystem/ui/icon";
import { Input } from "@canny_ecosystem/ui/input";
import { cn } from "@canny_ecosystem/ui/utils/cn";
import {
  createRole,
  deleteRole,
  hasPermission,
  readRole,
  replaceUnderscore,
  updateRole,
} from "@canny_ecosystem/utils";
import { attribute } from "@canny_ecosystem/utils/constant";
import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { type SetStateAction, Suspense, useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseWithHeaders({ request });
  const { user } = await getUserCookieOrFetchUser(request, supabase);

  if (!hasPermission(user?.role!, `${readRole}:${attribute.holidays}`))
    return safeRedirect(DEFAULT_ROUTE, { headers });

  try {
    const { companyId } = await getCompanyIdOrFirstCompany(request, supabase);

    const leaveTypePromise = getLeaveTypeByCompanyId({
      supabase,
      companyId,
    });

    const holidaysPromise = getHolidaysByCompanyId({ supabase, companyId });
    return defer({
      leaveTypePromise: leaveTypePromise as any,
      holidaysPromise: holidaysPromise as any,
    });
  } catch (error) {
    console.error("Leave Types Error in loader function:", error);

    return defer({
      leaveTypePromise: Promise.resolve({ data: [] }),
      holidaysPromise: Promise.resolve({ data: [] }),
    });
  }
}
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return await clientCaching(
    `${cacheKeyPrefix.holidays}${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export default function Holidays() {
  const { leaveTypePromise, holidaysPromise } = useLoaderData<typeof loader>();
  const { role } = useUser();
  const navigate = useNavigate();
  return (
    <div className='py-4'>
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={leaveTypePromise}>
            {({ data, error }) => {
              if (error) {
                clearCacheEntry(cacheKeyPrefix.holidays);
                return (
                  <ErrorBoundary
                    error={error}
                    message='Failed to load leave types'
                  />
                );
              }

              return (
                <>
                  {data.map((leave: LeaveTypeDatabaseRow) => (
                    <Card
                      key={leave.id}
                      className='bg-muted/10 hover:shadow-lg transition-shadow'
                    >
                      <LeaveTypeOptionsDropdown
                        id={leave.id}
                        triggerChild={
                          <DropdownMenuTrigger
                            className={cn(
                              "p-2 py-2 ml-auto mr-2 mt-2 rounded-md  grid place-items-center ",
                              !hasPermission(
                                role,
                                `${deleteRole}:${attribute.holidays}`
                              ) &&
                                !hasPermission(
                                  role,
                                  `${updateRole}:${attribute.holidays}`
                                ) &&
                                "hidden"
                            )}
                          >
                            <Icon name='dots-vertical' size='xs' />
                          </DropdownMenuTrigger>
                        }
                      />
                      <CardHeader className='p-0'>
                        <CardTitle className='text-lg text-center capitalize'>
                          {replaceUnderscore(leave.leave_type)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-muted-foreground text-center'>
                          Available Days: {leave.leaves_per_year}
                        </p>
                      </CardContent>
                    </Card>
                  ))}

                  {data.length < 5 && (
                    <Card
                      className='h-28 bg-muted/40 hover:shadow-lg transition-shadow cursor-pointer grid place-items-center'
                      onClick={() => navigate("add-leave-type")}
                    >
                      <Icon
                        name='plus'
                        size='xl'
                        className='shrink-0 flex justify-center items-center'
                      />
                    </Card>
                  )}
                </>
              );
            }}
          </Await>
        </Suspense>
      </div>

      <div className='my-5'>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={holidaysPromise}>
            {({ data, error }) => {
              if (error) {
                clearCacheEntry(cacheKeyPrefix.holidays);
                return (
                  <ErrorBoundary
                    error={error}
                    message='Failed to load holidays'
                  />
                );
              }
              const [searchString, setSearchString] = useState("");
              const [tableData, setTableData] = useState(data);

              useEffect(() => {
                const filteredData = data?.filter(
                  (item: { [s: string]: unknown } | ArrayLike<unknown>) =>
                    Object.entries(item).some(
                      ([key, value]) =>
                        key !== "avatar" &&
                        String(value)
                          .toLowerCase()
                          .includes(searchString.toLowerCase())
                    )
                );

                setTableData(filteredData);
              }, [searchString, data]);

              return (
                <div>
                  <div className='relative w-full lg:w-3/5 2xl:w-1/3 flex items-center gap-4'>
                    <div className='relative w-full my-4'>
                      <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
                        <Icon
                          name='magnifying-glass'
                          size='sm'
                          className='text-gray-400'
                        />
                      </div>
                      <Input
                        placeholder='Search Holidays'
                        value={searchString}
                        onChange={(e: {
                          target: { value: SetStateAction<string> };
                        }) => setSearchString(e.target.value)}
                        className='pl-8 h-10 w-full focus-visible:ring-0 shadow-none'
                      />
                    </div>
                    <Link
                      to='/time-tracking/holidays/add-holiday'
                      className={cn(
                        buttonVariants({ variant: "primary-outline" }),
                        "flex items-center gap-1",
                        !hasPermission(
                          role,
                          `${createRole}:${attribute.holidays}`
                        ) && "hidden"
                      )}
                    >
                      <span>Add</span>
                      <span className='hidden md:flex justify-end'>
                        Holiday
                      </span>
                    </Link>
                  </div>
                  <HolidaysDataTable data={tableData} columns={columns} />
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
      <Outlet />
    </div>
  );
}
