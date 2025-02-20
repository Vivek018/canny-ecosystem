import type {
  LeavesDatabaseInsert,
  LeavesDatabaseUpdate,
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
    .select()
    .single();

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
