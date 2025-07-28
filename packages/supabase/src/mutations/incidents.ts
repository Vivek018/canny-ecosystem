import { convertToNull } from "@canny_ecosystem/utils";
import type {
  IncidentsDatabaseInsert,
  IncidentsDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createIncident({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: IncidentsDatabaseInsert;
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

  const { error, status } = await supabase.from("incidents").insert(data);

  if (error) {
    console.error("createIncident error:", error);
  }

  return { status, error };
}

export async function updateIncidentById({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: IncidentsDatabaseUpdate;
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
    .from("incidents")
    .update(updateData)
    .eq("id", data.id!)
    .single();

  if (error) {
    console.error("updateIncidentById error:", error);
  }

  return { error, status };
}

export async function deleteIncidentById({
  supabase,
  id,
}: {
  supabase: TypedSupabaseClient;
  id: string;
}) {
  const { error, status } = await supabase
    .from("incidents")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteIncidentById error:", error);
  }

  return { status, error };
}
