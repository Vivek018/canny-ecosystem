import type {ReimbursementInsert,ReimbursementsUpdate,TypedSupabaseClient} from "../types";

export async function createReimbursementsFromData({supabase,data}: {
  supabase: TypedSupabaseClient;
  data: ReimbursementInsert;
}) {
  const { error, status } = await supabase
    .from("reimbursements")
    .insert(data)
    .select()
    .single();
  if (error) {
    console.error(error);
  }
  return { status, error };
}

export async function updateReimbursementsById({
  reimbursementId,
  supabase,
  data,
}: {
  reimbursementId: string;
  supabase: TypedSupabaseClient;
  data: ReimbursementsUpdate;
}) {
  const { error, status } = await supabase
    .from("reimbursements")
    .update(data)
    .eq("id", reimbursementId ?? "")
    .single();
  if (error) {
    console.error(error);
  }
  return { error, status };
}

export async function deleteReimbursementById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase
    .from("reimbursements")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Error deleting user:", error);
    return { status, error };
  }
  if (status < 200 || status >= 300) {
    console.error("Unexpected Supabase status:", status);
  }
  return { status, error: null };
}

export async function updateReimbursementsByEmployeeId({
  supabase,
  employee_id,
  data,
}: {
  supabase: TypedSupabaseClient;
  employee_id: string;
  data: any;
}) {
  const { error, status } = await supabase
    .from("reimbursements")
    .update(data)
    .eq("employee_id", employee_id ?? "")
    .single();

  if (error) console.error(error);

  return { error, status };
}
