import { convertToNull } from "@canny_ecosystem/utils";
import type {
  ProjectDatabaseInsert,
  ProjectDatabaseUpdate,
  TypedSupabaseClient,
} from "../types";

export async function createProject({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ProjectDatabaseInsert;
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
    data: projectData,
  } = await supabase.from("projects").insert(data).select().single();

  if (error) {
    console.error("createProject Error:", error);
  }

  return { status, error, id: projectData?.id };
}

export async function updateProject({
  supabase,
  data,
  bypassAuth = false,
}: {
  supabase: TypedSupabaseClient;
  data: ProjectDatabaseUpdate;
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
    .from("projects")
    .update(updateData)
    .eq("id", data.id!);
  if (error) {
    console.error("updateProject Error:", error);
  }

  return { status, error };
}

export async function deleteProject({
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
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteProject Error:", error);
  }

  return { status, error };
}
