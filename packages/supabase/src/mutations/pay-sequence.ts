import type {
  PaySequenceDatabaseInsert,
  PaySequenceDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createPaySequence({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: PaySequenceDatabaseInsert;
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

  const { error, status } = await supabase.from("pay_sequence").insert(data);

  if (error) {
    console.error("createPaySequence Error:", error);
  }

  return { status, error };
}

export async function updatePaySequenceById({
  paySequenceId,
  supabase,
  data,
}: {
  paySequenceId: string;
  supabase: TypedSupabaseClient;
  data: PaySequenceDatabaseUpdate;
}) {
  const { error, status } = await supabase
    .from("pay_sequence")
    .update(data)
    .eq("id", paySequenceId ?? "")
    .single();

  if (error) {
    console.error("updatePaySequenceById Error:", error);
  }

  return { error, status };
}

export async function deletePaySequenceById({
  supabase,
  id,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  id: string;
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
    .from("pay_sequence")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deletePaySequence Error:", error);
  }

  return { status, error };
}
