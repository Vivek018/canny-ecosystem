import { HARD_QUERY_LIMIT } from "../constant";
import type {
  InferredType,
  TypedSupabaseClient,
  UserDatabaseRow,
} from "../types";

export async function getUsers({
  supabase,
}: {
  supabase: TypedSupabaseClient;
}) {
  const columns = [
    "id",
    "avatar",
    "first_name",
    "last_name",
    "email",
    "mobile_number",
    "is_active",
  ] as const;

  const { data, error } = await supabase
    .from("users")
    .select(columns.join(","))
    .order("created_at", { ascending: false })
    .limit(HARD_QUERY_LIMIT)
    .returns<InferredType<UserDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getUsers Error", error);
  }

  return { data, error };
}

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
    "role",
    "avatar",
    "is_email_verified",
    "is_mobile_verified",
    "last_login",
    "preferred_language",
    "company_id",
    "site_id",
    "location_id",
    "is_active",
  ] as const;

  const { data, error } = await supabase
    .from("users")
    .select(columns.join(","))
    .eq("email", email)
    .single<InferredType<UserDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getUserByEmail Error", error);
  }

  return { data, error };
}

export async function getUsersByCompanyId({
  supabase,
  companyId,
}: {
  supabase: TypedSupabaseClient;
  companyId: string;
}) {
  const columns = [
    "id",
    "avatar",
    "first_name",
    "last_name",
    "email",
    "role",
    "mobile_number",
    "is_active",
    "company_id",
  ] as const;

  const { data, error } = await supabase
    .from("users")
    .select(columns.join(","))
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(HARD_QUERY_LIMIT)
    .returns<InferredType<UserDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getUsersByCompanyId Error", error);
  }

  return { data, error };
}

export async function getUsersEmail({
  supabase,
  companyId,
}: {
  companyId: string;
  supabase: TypedSupabaseClient;
}) {
  const columns = ["email"] as const;

  const { data, error } = await supabase
    .from("users")
    .select(`${columns.join(",")}`)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(HARD_QUERY_LIMIT)
    .returns<InferredType<UserDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getUsersEmail Error", error);
  }

  return { data, error };
}

export async function getUserById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "first_name",
    "last_name",
    "email",
    "mobile_number",
    "role",
    "avatar",
    "is_email_verified",
    "is_mobile_verified",
    "last_login",
    "preferred_language",
    "company_id",
    "site_id",
    "location_id",
    "is_active",
  ] as const;

  const { data, error } = await supabase
    .from("users")
    .select(columns.join(","))
    .eq("id", id)
    .single<InferredType<UserDatabaseRow, (typeof columns)[number]>>();

  if (error) {
    console.error("getUserById Error", error);
  }
  // return {
  //     data: {
  //       id: "1",
  //       email: "demo@gmail.com",
  //       first_name: "Demo",
  //       last_name: "User",
  //       role: "master",
  //     },
  //     error: null,
  //   };
  return { data, error };
}

export async function getUserIdsByUserEmails({
  supabase,
  userEmails,
}: {
  supabase: TypedSupabaseClient;
  userEmails: string[];
}) {
  const columns = ["email", "id"] as const;

  const { data, error } = await supabase
    .from("users")
    .select(columns.join(","))
    .in("email", userEmails)
    .returns<InferredType<UserDatabaseRow, (typeof columns)[number]>[]>();

  if (error) {
    console.error("getUserIdsByUserEmails Error", error);
  }

  return { data, error };
}
