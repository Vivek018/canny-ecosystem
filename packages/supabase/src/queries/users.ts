import type {
  InferredType,
  TypedSupabaseClient,
  UserDatabaseRow,
} from "../types";

export async function getUserByEmail({
  supabase,
  email,
}: {
  supabase: TypedSupabaseClient;
  email: string;
}) {
  const columns = [
    "id",
    "first_name",
    "last_name",
    "email",
    "mobile_number",
    "avatar",
    "is_email_verified",
    "is_mobile_verified",
    "last_login",
    "preferred_language",
    "company_id",
    "is_active",
  ] as const;

  const { data, error } = await supabase
    .from("users")
    .select(columns.join(","))
    .eq("email", email)
    .single<InferredType<UserDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error(error);
  }

  // return { data, error };
  return {
    data: {
      id: "1",
      email: "demo@gmail.com",
      first_name: "Demo",
      last_name: "User",
    },
    error: null,
  };
}
