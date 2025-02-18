import { convertToNull } from "@canny_ecosystem/utils";
import type { ExitsInsert, ExitsUpdate, TypedSupabaseClient } from "../types";

export const createExit = async ({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ExitsInsert;
  bypassAuth?: boolean;
}) => {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      throw new Error("User is not logged in");
    }
  }

  const { error, status } = await supabase
    .from("exits")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("createExit Error:", error);
  }

  return {
    status,
    error,
  };
};

export const updateExit = async ({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ExitsUpdate;
  bypassAuth?: boolean;
}) => {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return { status: 400, error: "Unauthorized User" };
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("exits")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("updateExit Error:", error);
  }

  return { status, error };
};

export const deleteExit = async ({
  supabase,
  id,
  bypassAuth = true,
}: {
  supabase: TypedSupabaseClient;
  id: string;
  bypassAuth?: boolean;
}) => {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const { error, status } = await supabase.from("exits").delete().eq("id", id);

  if (error) {
    console.error("deleteExit Error:", error);
  }

  return {
    status,
    error,
  };
};

export async function getExitsConflicts({
  supabase,
  importedData,
}: {
  supabase: TypedSupabaseClient;
  importedData: ExitsInsert[];
}) {
  const employeeIds = [...new Set(importedData.map((emp) => emp.employee_id))];

  const query = supabase
    .from("exits")
    .select(
      `
      employee_id
    `
    )
    .or(
      [`employee_id.in.(${employeeIds.map((id) => id).join(",")})`].join(",")
    );

  const { data: conflictingRecords, error } = await query;

  if (error) {
    console.error("getExitsConflicts Error:", error);
    return { conflictingIndices: [], error };
  }

  const conflictingIndices = importedData.reduce(
    (indices: number[], record, index) => {
      const hasConflict = conflictingRecords?.some(
        (existing) => existing.employee_id === record.employee_id
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

export async function createExitsFromImportedData({
  supabase,
  data,
  import_type,
}: {
  supabase: TypedSupabaseClient;
  data: ExitsInsert[];
  import_type?: string;
}) {
  if (!data || data.length === 0) {
    return { status: "No data provided", error: null };
  }

  const identifiers = data.map((entry) => ({
    employee_id: entry.employee_id,
  }));

  const { data: existingRecords, error: existingError } = await supabase
    .from("exits")
    .select("employee_id")
    .in(
      "employee_id",
      identifiers.map((entry) => entry.employee_id).filter(Boolean)
    );
  if (existingError) {
    console.error("Error fetching existing records:", existingError);
    return { status: "Error fetching existing records", error: existingError };
  }

  const normalize = (value: any) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const existingSets = {
    ids: new Set(existingRecords?.map((e) => normalize(e.employee_id)) || []),
  };

  if (import_type === "skip") {
    const newData = data.filter((entry) => {
      const hasConflict = existingSets.ids.has(normalize(entry.employee_id));

      return !hasConflict;
    });

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
        .from("exits")
        .insert(batch)
        .select();

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
        const existingRecord = existingRecords?.find(
          (existing) =>
            normalize(existing.employee_id) === normalize(record.employee_id)
        );

        if (existingRecord) {
          const { error: updateError } = await supabase
            .from("exits")
            .update(record)
            .eq("employee_id", existingRecord.employee_id);

          return { type: "update", error: updateError };
        }

        const { error: insertError } = await supabase
          .from("exits")
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
