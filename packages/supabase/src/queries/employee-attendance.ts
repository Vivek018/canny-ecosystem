import type {
  EmployeeAttendanceDatabaseRow,
  InferredType,
  TypedSupabaseClient,
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
    "working_shift",
    "holiday_type",
  ] as const;

  const { data, error } = await supabase
    .from("attendance")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .order("date", { ascending: true });
  if (error) console.error(error);

  return { data, error };
}

export async function getAttendanceByEmployeeIdAndDate({
  supabase,
  employeeId,
  date,
}: {
  supabase: TypedSupabaseClient;
  employeeId: string;
  date: string;
}) {
  const columns = [
    "date",
    "employee_id",
    "holiday",
    "no_of_hours",
    "present",
    "working_shift",
    "holiday_type",
  ] as const;

  const { data, error } = await supabase
    .from("attendance")
    .select(columns.join(","))
    .eq("employee_id", employeeId)
    .eq("date", date)
    .single<
      InferredType<EmployeeAttendanceDatabaseRow, (typeof columns)[number]>
    >();
  if (error) console.error(error);

  return { data, error };
}
