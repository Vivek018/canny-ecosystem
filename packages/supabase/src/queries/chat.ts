import { HARD_QUERY_LIMIT } from "../constant";
import type { ChatDatabaseRow, InferredType, TypedSupabaseClient } from "../types";

export async function getChatsByUserId({
  supabase,
  userId,
}: {
  supabase: TypedSupabaseClient;
  userId: string;
}) {
  const columns = [
    "id",
    "prompt",
  ] as const;

  const { data, status, error } = await supabase
    .from("chat")
    .select(
      `${columns.join(",")}`,
    )
    .eq("user_id", userId)
    .limit(HARD_QUERY_LIMIT)
    .order("created_at", { ascending: false })
    .returns<InferredType<ChatDatabaseRow, typeof columns[number]>[]>();

  if (error) {
    console.error("getChatsByUserId Error", error);
  }

  return { data, status, error };
}

export async function getChatById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const columns = [
    "id",
    "prompt",
    "query",
    "config",
    "user_id",
    "created_at",
  ] as const;

  const { data, error, status } = await supabase
    .from("chat")
    .select(
      `${columns.join(",")}`,
    )
    .eq("id", id)
    .single<InferredType<ChatDatabaseRow, typeof columns[number]>>();

  if (error) {
    console.error("getChatById Error", error);
  }

  return { data, status, error };
}

export async function getChatByPromptAndUserId({
  supabase,
  prompt,
  userId,
}: {
  supabase: TypedSupabaseClient;
  prompt: string;
  userId: string;
}) {
  const columns = [
    "id",
    "prompt",
    "query",
    "config",
    "user_id",
    "created_at",
  ] as const;

  const { data, error, status } = await supabase
    .from("chat")
    .select(
      `${columns.join(",")}`,
    )
    .eq("user_id", userId)
    .eq("prompt", prompt)
    .maybeSingle<InferredType<ChatDatabaseRow, typeof columns[number]>>();

  if (error) {
    console.error("getChatByPromptAndUserId Error", error);
  }

  return { data, status, error };
}
