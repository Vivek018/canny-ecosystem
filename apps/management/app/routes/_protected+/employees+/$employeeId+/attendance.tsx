import AttendanceComponent from "@/components/employees/attendance/attendance-component";
import { FilterList } from "@/components/employees/salary/filter-list";
import { SalaryFilter } from "@/components/employees/salary/salary-filter";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import {
  type DashboardFilters,
  getAttendanceByEmployeeId,
} from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { EmployeeMonthlyAttendanceDatabaseRow } from "@canny_ecosystem/supabase/types";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  type ClientLoaderFunctionArgs,
  defer,
  Outlet,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const employeeId = params.employeeId!;
    const searchParams = new URLSearchParams(url.searchParams);
    const { supabase } = getSupabaseWithHeaders({ request });

    const filters = {
      year: searchParams.get("year") ?? undefined,
    };

    const attendancePromise = getAttendanceByEmployeeId({
      employeeId: employeeId,
      supabase,
      filters,
    });

    return defer({
      attendancePromise: attendancePromise as any,
      filters,
      error: null,
    });
  } catch (error) {
    return defer({
      attendancePromise: null,
      error,
      filters: {},
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.attendance}${
      args.params.employeeId
    }${url.searchParams.toString()}`,
    args,
  );
}

clientLoader.hydrate = true;

export default function EmployeeAttendance() {
  const { attendancePromise, error, filters } = useLoaderData<typeof loader>();

  const { employeeId } = useParams();

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        message="Failed to load Employee Attendance"
      />
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Await resolve={attendancePromise}>
        {({ data, error }) => {
          if (error) {
            clearCacheEntry(`${cacheKeyPrefix.attendance}${employeeId}`);

            return (
              <ErrorBoundary
                error={error}
                message="Failed to load Employee Attendance"
              />
            );
          }

          return (
            <section className="py-4 flex flex-col gap-4">
              <div className="flex justify-end">
                <div className="flex justify-between gap-3">
                  <FilterList
                    filters={filters as unknown as DashboardFilters}
                  />
                  <SalaryFilter />
                </div>
              </div>
              {(data?.length ?? 0) > 0 ? (
                <div className="flex-1 w-full grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 justify-start auto-rows-min">
                  {data.map(
                    (
                      attendance: EmployeeMonthlyAttendanceDatabaseRow,
                      index: number,
                    ) => (
                      <AttendanceComponent
                        key={index.toString()}
                        attendanceData={attendance}
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="h-full w-full flex justify-center items-center text-xl">
                  No Attendance Data Found
                </div>
              )}
              <Outlet />
            </section>
          );
        }}
      </Await>
    </Suspense>
  );
}
