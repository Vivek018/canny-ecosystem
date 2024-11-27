import type { TypedSupabaseClient, UserDatabaseUpdate } from "../types";

export async function createUser({
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

  const { error, status } = await supabase.from("users").insert({
    first_name: user?.user_metadata.full_name.split(" ")[0],
    last_name: user?.user_metadata.full_name.split(" ")[1],
    email: user?.email,
    last_login: new Date().toISOString(),
  });

  if (error) {
    console.error(error);
  }

  return { status };
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
    return;
  }

  const { error, status } = await supabase
    .from("users")
    .update({
      last_login: new Date().toISOString(),
    })
    .eq("email", user.email);

  if (error) {
    console.error(error);
  }

  return { error, status };
}

export async function updateUser({
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

export async function deleteUser({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error deleting user:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("Unexpected Supabase status:", status);
  }

  return { status, error: null };
}
