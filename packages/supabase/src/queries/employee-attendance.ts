import type {
  EmployeeAttendanceDatabaseRow,
  TypedSupabaseClient,
  InferredType,
} from "../types";

export async function getAttendanceByEmployeeId({
  supabase,
  employeeId,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
}) {
  const columns = [
    "date",
    "employee_id",
    "holiday",
    "id",
    "no_of_hours",
    "present",
    "site_id",
    "total_working_days",
    "working_shift",
  ] as const;

  const { data, error } = await supabase
    .from("employee_attendance")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .single<
      InferredType<EmployeeAttendanceDatabaseRow, (typeof columns)[number]>
    >();

  if (error) console.error(error);

  return { data, error };
}
