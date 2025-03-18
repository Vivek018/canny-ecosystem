import { AttendanceComponent } from "@/components/employees/attendance/attendance-component";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cacheKeyPrefix } from "@/constant";
import { clearCacheEntry, clientCaching } from "@/utils/cache";
import { getAttendanceByEmployeeId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
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
      month: searchParams.get("month") ?? undefined,
      year: searchParams.get("year") ?? undefined,
    };

    const attendancePromise = getAttendanceByEmployeeId({
      employeeId: employeeId,
      supabase,
      params: {
        filters,
      },
    });

    return defer({
      attendancePromise: attendancePromise as any,
      filters,
      error: null,
    });
  } catch (error) {
    return defer({
      attendancePromise: null,
      filters: null,
      error,
    });
  }
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const url = new URL(args.request.url);
  return clientCaching(
    `${cacheKeyPrefix.attendance}${args.params.employeeId
    }${url.searchParams.toString()}`,
    args
  );
}

clientLoader.hydrate = true;

export default function EmployeeAttendance() {
  const { attendancePromise, filters, error } = useLoaderData<typeof loader>();

  const { employeeId } = useParams();

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        message='Failed to load Employee Attendance'
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
                message='Failed to load Employee Attendance'
              />
            );
          }

          return (
            <>
              <AttendanceComponent
                attendanceData={data}
                employeeId={employeeId}
                filters={filters}
              />
              <Outlet />
            </>
          );
        }}
      </Await>
    </Suspense>
  );
}
