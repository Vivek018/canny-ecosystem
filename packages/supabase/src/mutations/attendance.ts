import type {
  EmployeeMonthlyAttendanceDatabaseInsert,
  EmployeeMonthlyAttendanceDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function AddAttendance({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeMonthlyAttendanceDatabaseUpdate;
}) {
  const { error, status } = await supabase
    .from("monthly_attendance")
    .insert(data as EmployeeMonthlyAttendanceDatabaseInsert);

  if (error) {
    console.error("AddAttendance Error", error);
  }
  return { error, status };
}

export async function UpdateAttendance({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeMonthlyAttendanceDatabaseUpdate;
}) {
  const { error, status } = await supabase
    .from("monthly_attendance")
    .update(data)
    .eq("id", data.id!)
    .single();

  if (error) {
    console.error("updateOrAddAttendance Error", error);
  }

  return { error, status };
}

export async function createEmployeeAttendanceImportedData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeMonthlyAttendanceDatabaseInsert[];
}) {
  const { error, status } = await supabase
    .from("monthly_attendance")
    .upsert(data, {
      onConflict: "employee_id,month,year",
      ignoreDuplicates: true,
    })
    .select();

  if (error) {
    console.error("createAttendancesFromImportedData Error:", error);
  }

  return { status, error };
}

export async function deleteAttendanceById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase
    .from("monthly_attendance")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteAttendanceById Error:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("deleteAttendanceById Unexpected Supabase status:", status);
  }

  return { status, error: null };
}
