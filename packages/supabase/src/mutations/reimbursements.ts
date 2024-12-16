import type{ ReimbursementInsert, ReimbursementsUpdate, TypedSupabaseClient } from "../types";

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

export async function updateReimbursementsByEmployeeId({employee_id,
  supabase,
  data,
}: {
  employee_id: number;
  supabase: TypedSupabaseClient;
  data: ReimbursementsUpdate;
}) {
  
  

  const { error, status } = await supabase
    .from("reimbursements")
    .update(data)
    .eq("employee_id", employee_id ?? "")
    .single();

  if (error) {
    console.error(error);
  }

  return { error, status };
}
