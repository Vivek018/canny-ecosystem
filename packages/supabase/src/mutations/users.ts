import type { TypedSupabaseClient, UserDatabaseUpdate } from "../types";

export async function updateUserLastLoginAndSetAvatar({
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

  return { status };
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
    return;
  }

  const { error, status } = await supabase
    .from("users")
    .update(data)
    .eq("email", user.email)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return status;
}
