import { AttendanceComponent } from "@/components/employees/attendance/attendance-component";
import { getAttendanceByEmployeeId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { EmployeeAttendanceDatabaseRow } from "@canny_ecosystem/supabase/types";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const employeeId = params.employeeId!;
  const { supabase } = getSupabaseWithHeaders({ request });

  const filters = {
    month: searchParams.get("month") ?? undefined,
    year: searchParams.get("year") ?? undefined,
  };


  const { data, error } = await getAttendanceByEmployeeId({
    employeeId: employeeId,
    supabase,
    params: {
            filters,
          },
  });
  if (error) {
    console.error("Attendance Error", error);
  }

  return { data: data, employeeId,filters };
}

export default function EmployeeAttendance() {
  const { data, employeeId,filters } = useLoaderData<typeof loader>();

  return (
    <>
    <AttendanceComponent
      attendanceData={data as unknown as EmployeeAttendanceDatabaseRow[]}
      employeeId={employeeId}
      filters={filters }
    />
    <Outlet/>
    </>
  );
}
