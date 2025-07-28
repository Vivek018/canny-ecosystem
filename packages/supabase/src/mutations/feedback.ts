import type { FeedbackDatabaseInsert, TypedSupabaseClient } from "../types";

export async function createFeedback({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: FeedbackDatabaseInsert;
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

  const { error, status } = await supabase.from("feedback").insert(data);

  if (error) {
    console.error("createFeedback Error", error);
  }

  return { status, error };
}
