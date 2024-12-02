import type {
  TypedSupabaseClient,
  UserDatabaseInsert,
  UserDatabaseUpdate,
} from "../types";

export async function updateUserLastLogin({
  supabase,
}: {
  supabase: TypedSupabaseClient;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return;
  }

  const { error, status } = await supabase
    .from("users")
    .update({
      avatar: user?.user_metadata?.avatar_url,
      last_login: new Date().toISOString(),
    })
    .eq("email", user.email);

  if (error) {
    console.error(error);
  }

  return { error, status };
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

  const { error, status } = await supabase
    .from("users")
    .update(data)
    .eq("id", data.id ?? "")
    .single();

  if (error) {
    console.error(error);
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

  const { error, status } = await supabase
    .from("users")
    .update(data)
    .eq("email", user.email)
    .single();

  if (error) {
    console.error(error);
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
    console.error("Error deleting user:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("Unexpected Supabase status:", status);
  }

  return { status, error: null };
}

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
    console.error(error);
  }

  return { status, error };
}
