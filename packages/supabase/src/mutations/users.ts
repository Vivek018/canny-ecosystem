import { convertToNull } from "@canny_ecosystem/utils";
import type {
  TypedSupabaseClient,
  UserDatabaseInsert,
  UserDatabaseUpdate,
} from "../types";

export async function createUserById({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: UserDatabaseInsert;
}) {
  const { error, status } = await supabase
    .from("users")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("createUserById Error:", error);
  }

  return { status, error };
}

export async function updateUserLastLogin({
  supabase,
}: {
  supabase: TypedSupabaseClient;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      data: null,
      error: "No Email Found",
      status: 404,
    };
  }

  const { data, error, status } = await supabase
    .from("users")
    .update({
      avatar: user?.user_metadata?.avatar_url,
      last_login: new Date().toISOString(),
    })
    .eq("email", user.email)
    .select()
    .single();

  if (error) {
    console.error("updateUserLastLogin Error:", error);
  }

  return { data, error, status };
}

export async function updateUserById({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: UserDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: 400,
      error: "No email found",
    };
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", data.id ?? "")
    .single();

  if (error) {
    console.error("updateUserById Error:", error);
  }

  return { error, status };
}

export async function updateSameUserByEmail({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: UserDatabaseUpdate;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      status: 400,
      error: "No email found",
    };
  }

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("users")
    .update(updateData)
    .eq("email", user.email)
    .single();

  if (error) {
    console.error("updateSameUserByEmail Error:", error);
  }

  return { error, status };
}

export async function deleteUserById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase.from("users").delete().eq("id", id);

  if (error) {
    console.error("deleteUserById Error:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("deleteUserById Unexpected Supabase status:", status);
  }

  return { status, error: null };
}