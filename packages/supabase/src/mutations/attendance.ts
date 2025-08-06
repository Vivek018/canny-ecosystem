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

export async function createAttendanceByPayrollImportAndGiveID({
  supabase,
  month,
  year,
  employee_id,
  insertData,
}: {
  supabase: TypedSupabaseClient;
  year: number;
  month: number;
  employee_id: string;
  insertData: Partial<EmployeeMonthlyAttendanceDatabaseInsert>;
}) {
  const { data, error, status } = await supabase
    .from("monthly_attendance")
    .insert([
      {
        ...insertData,
        employee_id,
        month,
        year,
      },
    ])
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existingData, error: selectError } = await supabase
        .from("monthly_attendance")
        .select("id")
        .eq("employee_id", employee_id)
        .eq("month", month)
        .eq("year", year)
        .single();

      if (selectError || !existingData) {
        console.error("Error fetching existing attendance:", selectError);
        return { data: null, error: selectError || new Error("Not found") };
      }

      return { data: existingData, error: null, status: 200 };
    }

    console.error("createAttendanceByPayrollImportAndGiveID Error:", error);
    return { data: null, error, status };
  }

  return { data, error: null, status };
}

export async function updateMultipleAttendances({
  supabase,
  attendancesData,
}: {
  supabase: TypedSupabaseClient;
  attendancesData: EmployeeMonthlyAttendanceDatabaseUpdate[];
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: 400,
      error: "No email found",
    };
  }

  for (const entry of attendancesData) {
    const updateObj: Record<string, any> = {};
    if (entry.month) updateObj.month = entry.month;
    if (entry.year) updateObj.year = entry.year;
    if (entry.working_days) updateObj.working_days = entry.working_days;

    if (Object.keys(updateObj).length === 0) continue;

    const { error, status } = await supabase
      .from("monthly_attendance")
      .update(updateObj)
      .eq("id", entry.id!);

    if (error) {
      console.error("Error updating entry:", error);
      return { error, status };
    }
  }

  return { error: null, status: 200 };
}


export async function deleteMultipleAttendances({
  supabase,
  attendanceIds,
}: {
  supabase: TypedSupabaseClient;
  attendanceIds: string[];
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: 400,
      error: "No email found",
    };
  }

  if (!attendanceIds || attendanceIds.length === 0) {
    return {
      status: 400,
      error: "No attendance IDs provided",
    };
  }

  const { error, status } = await supabase
    .from("monthly_attendance")
    .delete()
    .in("id", attendanceIds);

  if (error) {
    console.error("Error deleting attendances:", error);
    return { error, status };
  }

  return { error: null, status };
}
