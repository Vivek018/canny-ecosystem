import type { ChatDatabaseInsert, TypedSupabaseClient } from "../types";

export async function createChat({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ChatDatabaseInsert;
  bypassAuth?: boolean;
}) {
  if (!bypassAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { status: 400, error: "Unauthorized User" };
    }
  }

  const { error, status } = await supabase.from("chat").insert(data);

  if (error) {
    console.error("createChat Error", error);
  }

  return { status, error };
}

export async function deleteChatById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase.from("chat").delete().eq("id", id);

  if (error) {
    console.error("deleteChatById error:", error);
  }

  return { status, error };
}
