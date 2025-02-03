import { AttendanceComponent } from "@/components/employees/attendance/attendance-component";
import { getAttendanceByEmployeeId } from "@canny_ecosystem/supabase/queries";
import { getSupabaseWithHeaders } from "@canny_ecosystem/supabase/server";
import type { EmployeeAttendanceDatabaseRow } from "@canny_ecosystem/supabase/types";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const employeeId = params.employeeId!;
  const { supabase } = getSupabaseWithHeaders({ request });

  const { data, error } = await getAttendanceByEmployeeId({
    employeeId: employeeId,
    supabase,
  });
  if (error) {
    console.error("Attendance Error", error);
  }

  return { data: data, employeeId };
}

export default function EmployeeAttendance() {
  const { data, employeeId } = useLoaderData<typeof loader>();

  return (
    <>
    <AttendanceComponent
      attendanceData={data as unknown as EmployeeAttendanceDatabaseRow[]}
      employeeId={employeeId}
    />
    <Outlet/>
    </>
  );
}
