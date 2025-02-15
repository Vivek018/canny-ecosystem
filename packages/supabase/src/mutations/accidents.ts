import type {
  AccidentsDatabaseInsert,
  AccidentsDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createAccident({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: AccidentsDatabaseInsert[];
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

  const { error, status } = await supabase
    .from("accidents")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(error);
  }

  return { status, error };
}

export async function updateAccidentsById({
  accidentId,
  supabase,
  data,
}: {
  accidentId: string;
  supabase: TypedSupabaseClient;
  data: AccidentsDatabaseUpdate[];
}) {
  const { error, status } = await supabase
    .from("accidents")
    .update(data)
    .eq("id", accidentId ?? "")
    .single();

  if (error) {
    console.error(error);
  }

  return { error, status };
}

export async function deleteAccidentById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase
    .from("accidents")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting user:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("Unexpected Supabase status:", status);
  }

  return { status, error: null };
}
