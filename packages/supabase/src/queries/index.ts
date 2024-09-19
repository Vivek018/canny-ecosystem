import type { TypedSupabaseClient } from "../types";

export async function getUserQuery({
  supabase,
  email,
}: {
  supabase: TypedSupabaseClient;
  email: string;
}) {
  const { data, error } = await supabase
    .from("user")
    .select("id, first_name, last_name, email, avatar, last_checked_in, created_at")
    .eq("email", email)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
