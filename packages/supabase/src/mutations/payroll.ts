import type { PayrollDatabaseInsert, TypedSupabaseClient } from "../types";

export async function createPayroll({
  supabase,
  data,
}: { supabase: TypedSupabaseClient; data: PayrollDatabaseInsert }) {

  const { error, status } = await supabase
    .from("payroll")
    .insert(data)
    .select()
    .single();

  if (error) console.error(error);

  return { status, error };
}
