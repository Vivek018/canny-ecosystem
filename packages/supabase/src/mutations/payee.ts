import { convertToNull } from "@canny_ecosystem/utils";
import type {
  PayeeDatabaseInsert,
  PayeeDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createPayeeById({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: PayeeDatabaseInsert;
}) {
  const { error, status } = await supabase.from("payee").insert(data);

  if (error) {
    console.error("createPayeeById Error:", error);
  }

  return { status, error };
}

export async function deletePayeeById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase.from("payee").delete().eq("id", id);

  if (error) {
    console.error("deletePayeeById Error:", error);
    return { status, error };
  }

  if (status < 200 || status >= 300) {
    console.error("deletePayeeById Unexpected Supabase status:", status);
  }

  return { status, error: null };
}

export async function updatePayeeById({
  supabase,
  data,
}: {
  supabase: TypedSupabaseClient;
  data: PayeeDatabaseUpdate;
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
    .from("payee")
    .update(updateData)
    .eq("id", data.id ?? "")
    .single();

  if (error) console.error("updatePayeeById Error:", error);

  return { error, status };
}
