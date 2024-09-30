import type { TypedSupabaseClient } from "../types";

export async function getUserByEmailQuery({
  supabase,
  email,
}: {
  supabase: TypedSupabaseClient;
  email: string;
}) {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, first_name, last_name, email, mobile_number, avatar, is_email_verified, is_mobile_verified, last_login, preferred_language, company_id, is_active",
    )
    .eq("email", email)
    .single();

  return { data, error };
}