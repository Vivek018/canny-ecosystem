import { convertToNull } from "@canny_ecosystem/utils";
import type {
  StatutoryBonusDatabaseInsert,
  StatutoryBonusDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createStatutoryBonus({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: StatutoryBonusDatabaseInsert;
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

  const {
    error,
    status,
    data: statutoryBonusData,
  } = await supabase.from("statutory_bonus").insert(data).select().single();

  if (error) {
    console.error("createStatutoryBonus Error:", error);
  }

  return {
    statutoryBonusData,
    status,
    error,
  };
}

export async function updateStatutoryBonus({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: StatutoryBonusDatabaseUpdate;
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
    .from("statutory_bonus")
    .update(updateData)
    .eq("id", data.id!)
    .select()
    .single();

  if (error) {
    console.error("updateStatutoryBonus Error:", error);
  }

  return {
    status,
    error,
  };
}

export async function deleteStatutoryBonus({
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
    .from("statutory_bonus")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteStatutoryBonus Error:", error);
  }

  return { status, error };
}