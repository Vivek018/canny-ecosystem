import { convertToNull } from "@canny_ecosystem/utils";
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
    console.error("createAccident error:", error);
  }

  return { status, error };
}

export async function updateAccidentById({
  supabase,
  data,
  bypassAuth = false
}: {
  supabase: TypedSupabaseClient;
  data: AccidentsDatabaseUpdate;
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

  const updateData = convertToNull(data);

  const { error, status } = await supabase
    .from("accidents")
    .update(updateData)
    .eq("id", data.id!)
    .single();

  if (error) {
    console.error("updateAccidentById error:", error);
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
    console.error("deleteAccidentById error:", error);
  }

  return { status, error };
}
