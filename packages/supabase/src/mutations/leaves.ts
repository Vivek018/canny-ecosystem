import type {
  LeavesDatabaseInsert,
  LeavesDatabaseUpdate,
  LeaveTypeDatabaseInsert,
  TypedSupabaseClient,
} from "../types";

export async function addLeavesFromData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: LeavesDatabaseInsert;
}) {
  const { error, status } = await supabase
    .from("leaves")
    .insert(data)
    ;

  if (error) {
    console.error("createLeavesFromData Error:", error);
  }

  return { status, error };
}

export async function deleteLeaveById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase.from("leaves").delete().eq("id", id);

  if (error) {
    console.error("deleteLeaveById Error:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("deleteLeaveById Unexpected Supabase status:", status);
  }

  return { status, error: null };
}

export async function updateLeavesById({
  leaveId,
  supabase,
  data,
}: {
  leaveId: string;
  supabase: TypedSupabaseClient;
  data: LeavesDatabaseUpdate;
}) {
  const { error, status } = await supabase
    .from("leaves")
    .update(data)
    .eq("id", leaveId ?? "")
    .single();

  if (error) {
    console.error("updateLeavesById Error:", error);
  }

  return { error, status };
}

export async function addLeaveTypeFromData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: LeaveTypeDatabaseInsert;
}) {
  const { error, status } = await supabase
    .from("leave_type")
    .insert(data)
    ;

  if (error) {
    console.error("createLeaveTypeFromData Error:", error);
  }

  return { status, error };
}

export async function updateLeaveTypeById({
  leaveTypeId,
  supabase,
  data,
}: {
  leaveTypeId: string;
  supabase: TypedSupabaseClient;
  data: LeavesDatabaseUpdate;
}) {
  const { error, status } = await supabase
    .from("leave_type")
    .update(data)
    .eq("id", leaveTypeId ?? "")
    .single();

  if (error) {
    console.error("updateLeaveTypeById Error:", error);
  }

  return { error, status };
}

export async function deleteLeaveTypeById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase
    .from("leave_type")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteLeaveTypeById Error:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("deleteLeaveTypeById Unexpected Supabase status:", status);
  }

  return { status, error: null };
}

export async function createLeavesFromImportedData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: LeavesDatabaseInsert[];
}) {
  const { error, status } = await supabase.from("leaves").insert(data);

  if (error) {
    console.error("createLeavesFromImportedData Error:", error);
  }

  return { status, error };
}
