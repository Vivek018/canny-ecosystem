import { convertToNull } from "@canny_ecosystem/utils";
import type {
  CasesDatabaseInsert,
  CasesDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createCase({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: CasesDatabaseInsert;
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

  const { error, status } = await supabase.from("cases").insert(data);

  if (error) {
    console.error("createCases error:", error);
  }

  return { status, error };
}

export async function updateCaseById({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: CasesDatabaseUpdate;
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
    .from("cases")
    .update(updateData)
    .eq("id", data.id!)
    .single();

  if (error) {
    console.error("updateCasesById error:", error);
  }

  return { error, status };
}

export async function deleteCasesById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase.from("cases").delete().eq("id", id);

  if (error) {
    console.error("deleteCasesById error:", error);
  }

  return { status, error };
}
