import type{ ReimbursementInsert, TypedSupabaseClient } from "../types";

export async function createReimbursementsFromData({
  supabase,
  data,
}: {
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

export async function updateReimbursementsFromData({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: ReimbursementInsert;
}) {
  const { error, status } = await supabase
    .from("reimbursements")
    .update(data)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}
