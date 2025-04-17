import type {
  EmployeeAttendanceDatabaseInsert,
  EmployeeAttendanceDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function deleteAttendanceByDate({
  supabase,
  date,
}: {
  supabase: TypedSupabaseClient;
  date: string;
}) {
  const { error, status } = await supabase
    .from("attendance")
    .delete()
    .eq("date", date);

  if (error) {
    console.error("deleteAttendanceByDate Error", error);
  }

  if (status < 200 || status >= 300) {
    console.error("Unexpected Supabase status:", status);
  }

  return { status, error };
}

export async function updateOrAddAttendance({
  supabase,
  data,
  type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeAttendanceDatabaseUpdate;
  type: "update" | "add";
}) {
  if (type === "update" && data.date && data.employee_id) {
    const { error, status } = await supabase
      .from("attendance")
      .update(data)
      .eq("date", data.date)
      .eq("employee_id", data.employee_id)
      .single();

    if (error) {
      console.error("updateOrAddAttendance Error", error);
    }

    return { error, status };
  }

  const { error, status } = await supabase
    .from("attendance")
    .insert(data as EmployeeAttendanceDatabaseInsert);

  if (error) {
    console.error("updateOrAddAttendance Error", error);
  }
  return { error, status };
}

export async function getEmployeeAttendanceConflicts({
  supabase,
  importedData,
}: {
  supabase: TypedSupabaseClient;
  importedData: EmployeeAttendanceDatabaseInsert[];
}) {
  const employeeIds = [...new Set(importedData.map((emp) => emp.employee_id))];

  const query = supabase
    .from("attendance")
    .select("employee_id, date")
    .in("employee_id", employeeIds);

  const { data: existingRecords, error } = await query;

  if (error) {
    console.error("Error fetching conflicts:", error);
    return { conflictingIndices: [], error };
  }

  const conflictingIndices = importedData.reduce(
    (indices: number[], record, index) => {
      const hasConflict = existingRecords?.some(
        (existing) =>
          existing.employee_id === record.employee_id &&
          existing.date === record.date
      );

      if (hasConflict) {
        indices.push(index);
      }
      return indices;
    },
    []
  );

  return { conflictingIndices, error: null };
}

export async function createEmployeeAttendanceFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeAttendanceDatabaseInsert[];
  import_type?: string;
}) {
  if (!data || data.length === 0) {
    return { status: "No data provided", error: null };
  }

  const identifiers = data.map((entry) => ({
    employee_id: entry.employee_id,
    date: entry.date,
  }));

  const { data: existingRecords, error: existingError } = await supabase
    .from("attendance")
    .select("employee_id, date")
    .in(
      "employee_id",
      identifiers.map((entry) => entry.employee_id).filter(Boolean)
    );

  if (existingError) {
    console.error("Error fetching existing records:", existingError);
    return { status: "Error fetching existing records", error: existingError };
  }

  const existingSet = new Set(
    existingRecords?.map((record) => `${record.employee_id}-${record.date}`) ||
      []
  );

  if (import_type === "skip") {
    const newData = data.filter(
      (entry) => !existingSet.has(`${entry.employee_id}-${entry.date}`)
    );

    if (newData.length === 0) {
      return {
        status: "No new data to insert after filtering duplicates",
        error: null,
      };
    }

    const BATCH_SIZE = 50;
    for (let i = 0; i < newData.length; i += BATCH_SIZE) {
      const batch = newData.slice(i, Math.min(i + BATCH_SIZE, newData.length));

      const { error: insertError } = await supabase
        .from("attendance")
        .insert(batch);
      if (insertError) {
        console.error("Error inserting batch:", insertError);
      }
    }

    return {
      status: "Successfully inserted new records",
      error: null,
    };
  }

  if (import_type === "overwrite") {
    const results = await Promise.all(
      data.map(async (record) => {
        const existingRecordKey = `${record.employee_id}-${record.date}`;

        if (existingSet.has(existingRecordKey)) {
          const { error: updateError } = await supabase
            .from("attendance")
            .update(record)
            .eq("employee_id", record.employee_id!)
            .eq("date", record.date!);

          return { type: "update", error: updateError };
        }

        const { error: insertError } = await supabase
          .from("attendance")
          .insert(record);

        return { type: "insert", error: insertError };
      })
    );

    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      console.error("Errors during processing:", errors);
    }

    return {
      status: "Successfully processed updates and new insertions",
      error: null,
    };
  }

  return {
    status: "Invalid import_type specified",
    error: new Error("Invalid import_type"),
  };
}

export async function createEmployeeAttendanceByPresentsFromImportedData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: EmployeeAttendanceDatabaseInsert[];
}) {
  if (!data || data.length === 0) {
    return { status: "No data provided", error: null };
  }

  const identifiers = data.map((entry) => ({
    employee_id: entry.employee_id,
    date: entry.date,
  }));

  const { data: existingRecords, error: existingError } = await supabase
    .from("attendance")
    .select("employee_id, date")
    .in(
      "employee_id",
      identifiers.map((entry) => entry.employee_id).filter(Boolean)
    );

  if (existingError) {
    console.error("Error fetching existing records:", existingError);
    return { status: "Error fetching existing records", error: existingError };
  }

  const existingSet = new Set(
    existingRecords?.map((record) => `${record.employee_id}-${record.date}`) ||
      []
  );

  const newData = data.filter(
    (entry) => !existingSet.has(`${entry.employee_id}-${entry.date}`)
  );

  if (newData.length === 0) {
    return {
      status: "No new data to insert after filtering duplicates",
      error: null,
    };
  }

  const BATCH_SIZE = 50;
  for (let i = 0; i < newData.length; i += BATCH_SIZE) {
    const batch = newData.slice(i, Math.min(i + BATCH_SIZE, newData.length));

    const { error: insertError } = await supabase
      .from("attendance")
      .insert(batch);
    if (insertError) {
      console.error("Error inserting batch:", insertError);
    }
  }

  return {
    status: "Successfully inserted new records",
    error: null,
  };
}
